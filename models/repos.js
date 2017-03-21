const remoteProcess = require('electron').remote.process
const dialog = require('electron').remote.dialog
const ConsoleStream = require('console-stream')
const ipc = require('electron').ipcRenderer
const waterfall = require('run-waterfall')
const app = require('electron').remote.app
const encoding = require('dat-encoding')
const shell = require('electron').shell
const Multidat = require('multidat')
const minimist = require('minimist')
const Worker = require('dat-worker')
const toilet = require('toiletdb')
const assert = require('assert')
const mkdirp = require('mkdirp')
const xtend = require('xtend')
const path = require('path')

const Modal = require('../elements/modal')

function noop () {}

if (process.env.RUNNING_IN_SPECTRON) {
  dialog.showOpenDialog = (opts, cb) => {
    return [path.join(__dirname, '..', 'tests', 'fixtures')]
  }
}

var argv = minimist(remoteProcess.argv.slice(2))
var downloadsDir = (argv.data)
  ? argv.data
  : path.join(app.getPath('downloads'), '/dat')

module.exports = reposModel

function reposModel (state, bus) {
  state.repos = xtend({
    downloadsDir: downloadsDir,
    removalKey: null,
    ready: false,
    values: []
  }, state.repos)

  var manager = null
  var dbPaused = null

  function onerror (err) {
    if (err) bus.emit('error', err)
  }

  // boot multidat, create the ~/Downloads/dat directory
  var dbLocation = argv.db || path.join(process.env.HOME, '.dat-desktop')
  var dbMultidriveFile = path.join(dbLocation, 'dats.json')
  var dbPausedFile = path.join(dbLocation, 'paused.json')

  var tasks = [
    function (next) {
      mkdirp(dbLocation, next)
    },
    function (_, next) {
      mkdirp(downloadsDir, next)
    },
    function (_, next) {
      var dbMultidrive = toilet(dbMultidriveFile)
      dbPaused = toilet(dbPausedFile)
      Multidat(dbMultidrive, {
        dat: Worker,
        stdout: ConsoleStream(),
        stderr: ConsoleStream()
      }, next)
    },
    function (multidat, done) {
      manager = createManager(multidat, function (err, dats) {
        state.repos.values = dats
        bus.emit('render')
      })
      app.on('before-quit', function () {
        manager.closeAll()
      })
      bus.emit('repos loaded')
      done()
    }
  ]

  waterfall(tasks, onerror)

  // open the dat archive in the native filesystem explorer
  bus.on('open directory', function (path) {
    var pathname = 'file://' + path.resolve(path)
    shell.openExternal(pathname, onerror)
  })

  // choose a directory and convert it to a dat archive
  bus.on('create dat', function (pathname) {
    if (!pathname) {
      var files = dialog.showOpenDialog({
        properties: ['openDirectory']
      })
      if (!files || !files.length) return
      pathname = files[0]
    }
    manager.create(pathname, onerror)
  })

  bus.on('remove dat', function (key) {
    const modal = Modal.confirm()(function () {
      dbPaused.write(key, false, function (err) {
        if (err) return onerror(err)
        manager.close(key, onerror)
      })
    })
    document.body.appendChild(modal)
  })

  bus.on('clone repo', function (key) {
    cloneRepo(key)
  })
  ipc.on('link', function (event, url) {
    cloneRepo(url)
  })

  function cloneRepo (_key) {
    try {
      var key = encoding.toStr(_key)
    } catch (e) {
      return onerror(new Error("The value you entered doesn't appear to be a valid Dat link"))
    }

    mkdirp(state.repos.downloadsDir, function (err) {
      if (err) return onerror(err)
      var dir = path.join(state.repos.downloadsDir, key)

      mkdirp(dir, function (err) {
        if (err) return onerror(err)

        var opts = { key: key }
        manager.create(dir, opts, onerror)
      })
    })
  }

  // copy a dat share link to clipboard and open a modal
  bus.on('share dat', function (dat) {
    assert.ok(dat.key, 'repos-model.shareDat: data.key should exist')
    const encodedKey = encoding.toStr(dat.key)
    const modal = Modal.link()(encodedKey)
    document.body.appendChild(modal)
  })

  bus.on('toggle pause', function (dat) {
    const key = encoding.toStr(dat.key)

    dbPaused.read((err, paused) => {
      if (err) return onerror(err)
      if (paused[key]) resume()
      else pause()
    })

    function resume () {
      dat.joinNetwork()
      dbPaused.write(key, false, onerror)
    }

    function pause () {
      dat.leaveNetwork()
      dbPaused.write(key, true, onerror)
    }
  })

  bus.on('remove dat', function (dat) {
    const modal = Modal.confirm()(function () {
      dbPaused.write(dat.key, false, function (err) {
        if (err) return onerror(err)
        manager.close(dat.key, onerror)
      })
    })
    document.body.appendChild(modal)
  })

  // handle IPC events from the server
  ipc.on('log', (ev, str) => console.log(str))
  ipc.send('ready')

  // creates a wrapper for all dats. Handles stats, and updates choo's internal
  // state whenever a mutation happens
  function createManager (multidat, onupdate) {
    assert.ok(multidat, 'models/repos: multidat should exist')
    assert.ok(onupdate, 'models/repos: onupdate should exist')

    // add stats to all recreated dats
    var dats = multidat.list()
    dats.forEach(initDat)
    onupdate(null, dats)

    return {
      create: create,
      close: close,
      closeAll: closeAll
    }

    function create (dir, opts, cb) {
      if (!cb) {
        cb = opts
        opts = {}
      }

      assert.equal(typeof dir, 'string', 'models/repos: dat-manager: dir should be a string')
      assert.equal(typeof opts, 'object', 'models/repos: dat-manager: opts should be a object')
      assert.equal(typeof cb, 'function', 'models/repos: dat-manager: cb should be a function')

      opts = Object.assign(opts, {
        watch: true,
        resume: true,
        ignoreHidden: true,
        compareFileContent: true
      })

      multidat.create(dir, opts, function (err, dat) {
        if (err) return cb(err)
        initDat(dat)
        update()
        cb(null, dat)
      })
    }

    function close (key, cb) {
      multidat.close(key, function (err) {
        if (err) return cb(err)
        update()
        cb()
      })
    }

    function closeAll () {
      multidat.list().forEach(function (dat) {
        dat.close(noop)
      })
    }

    function update () {
      var dats = multidat.list().slice()
      dats.forEach(function (dat) {
        var stats = dat.stats && dat.stats.get()
        dat.progress = (!stats)
          ? 0
          : (stats.blocksTotal)
            ? Math.min(1, stats.blocksProgress / stats.blocksTotal)
            : 0
      })

      var incomplete = dats.filter(function (dat) {
        return dat.network && dat.progress < 1
      })
      var progress = incomplete.reduce(function (acc, dat) {
        return acc + dat.progress
      }, 0) / incomplete.length
      if (progress === 1) progress = -1 // deactivate

      ipc.send('progress', progress)
      onupdate(null, dats)
    }

    function initDat (dat) {
      const key = encoding.toStr(dat.key)
      dbPaused.read((err, paused) => {
        if (err) throw err
        if (!paused[key]) {
          dat.joinNetwork()
        }
      })

      dat.metadata = {}

      multidat.readManifest(dat, function (_, manifest) {
        if (!manifest) return
        dat.metadata.title = manifest.title
        dat.metadata.author = manifest.author
        update()
      })

      dat.on('update', update)

      window.addEventListener('beforeunload', () => dat.close())
      process.on('uncaughtException', () => dat.close())
    }
  }
}
