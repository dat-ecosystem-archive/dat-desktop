const remoteProcess = require('electron').remote.process
const dialog = require('electron').remote.dialog
const ipc = require('electron').ipcRenderer
const waterfall = require('run-waterfall')
const app = require('electron').remote.app
const encoding = require('dat-encoding')
const Multidat = require('multidat')
const minimist = require('minimist')
const toilet = require('toiletdb')
const assert = require('assert')
const mkdirp = require('mkdirp')
const open = require('open')
const path = require('path')
const ConfirmModal = require('../elements/confirm-modal')
const LinkModal = require('../elements/link-modal')
const ConsoleStream = require('console-stream')

const electronModulePath = path.join(remoteProcess.resourcesPath, '/../node_modules/electron')
const electronPath = require(electronModulePath)

module.exports = createModel

function createModel () {
  let manager = null

  const argv = minimist(remoteProcess.argv.slice(2))
  const downloadsDir = (argv.data)
    ? argv.data
    : path.join(app.getPath('downloads'), '/dat')

  return {
    namespace: 'repos',
    state: {
      downloadsDir: downloadsDir,
      removalKey: null,
      ready: false,
      values: []
    },
    subscriptions: {
      start: startMultidat,
      onIpc: handleIpc
    },
    reducers: {
      ready: multidatReady,
      update: updateDats
    },
    effects: {
      create: createDat,
      remove: removeDat,
      open: openDirectory,
      share: shareDat,
      clone: cloneDat,
      shareState: shareState
    }
  }

  // boot multidat, create the ~/Downloads/dat directory
  function startMultidat (send, done) {
    const dbLocation = path.join(process.env.HOME, '.dat-desktop')
    const dbFile = path.join(dbLocation, 'dats.json')

    const tasks = [
      function (next) {
        mkdirp(dbLocation, next)
      },
      function (_, next) {
        mkdirp(downloadsDir, next)
      },
      function (_, next) {
        const db = toilet(dbFile)
        Multidat(db, {
          worker: true,
          execPath: electronPath,
          stdout: ConsoleStream(),
          stderr: ConsoleStream()
        }, next)
      },
      function (multidat, next) {
        send('repos:ready', function (err) {
          if (err) return next(err)
          next(null, multidat)
        })
      },
      function (multidat, next) {
        manager = createManager(multidat, function (err, dats) {
          if (err) return done(err)
          send('repos:update', dats, next)
        })
      },
      function (_, next) {
        // show the welcome screen if you start without any dats
        send('mainView:loadWelcomeScreenPerhaps', done)
      }
    ]

    waterfall(tasks, done)
  }

  // share state with external model
  function shareState (state, data, send, done) {
    done(null, state)
  }

  // signal multidat is ready to accept values
  function multidatReady (state, data) {
    return { ready: true }
  }

  // update the values with then new values from the manager
  function updateDats (state, data) {
    return { values: data }
  }

  // handle IPC events from the server
  function handleIpc (send, done) {
    ipc.on('link', (event, url) => {
      const key = encoding.decode(url)
      send('repos:clone', key, done)
    })
    ipc.on('log', (ev, str) => console.log(str))
    ipc.send('ready')
  }

  // open the dat archive in the native filesystem explorer
  function openDirectory (state, data, send, done) {
    assert.ok(data.path, 'repos-model.openDirectory: data.path should exist')
    open(data.path, done)
  }

  // choose a directory and convert it to a dat archive
  function createDat (state, data, send, done) {
    var pathname = data
    if (!pathname) {
      var files = dialog.showOpenDialog({
        properties: ['openDirectory']
      })
      if (!files || !files.length) return done()
      pathname = files[0]
    }
    manager.create(pathname, done)
  }

  function removeDat (state, data, send, done) {
    const key = data.key
    const modal = ConfirmModal()(function () {
      manager.close(key, done)
    })
    document.body.appendChild(modal)
  }

  // copy a dat share link to clipboard and open a modal
  function shareDat (state, data, send, done) {
    assert.ok(data.key, 'repos-model.shareDat: data.key should exist')
    const encodedKey = encoding.encode(data.key)
    const modal = LinkModal()(encodedKey)
    document.body.appendChild(modal)
  }

  function cloneDat (state, data, send, done) {
    assert.ok(Buffer.isBuffer(data) || typeof data === 'string', 'repos-model.cloneDat: data should be a buffer or a string')

    try {
      var key = encoding.decode(data).toString('hex')
    } catch (e) {
      return done(new Error("The value you entered doesn't appear to be a valid Dat link"))
    }

    mkdirp(state.downloadsDir, function (err) {
      if (err) return done(err)
      var dir = path.join(state.downloadsDir, key)

      mkdirp(dir, function (err) {
        if (err) return done(err)

        var opts = { key: key }
        manager.create(dir, opts, done)
      })
    })
  }
}

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
    close: close
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

  function update () {
    var dats = multidat.list().slice()
    onupdate(null, dats)
  }

  function initDat (dat) {
    dat.metadata = {}

    multidat.readManifest(dat, function (_, manifest) {
      if (!manifest) return
      dat.metadata.title = manifest.title
      dat.metadata.author = manifest.author
      update()
    })

    dat.on('update', update)

    app.on('before-quit', () => dat.close())
    window.addEventListener('beforeunload', () => dat.close())
    process.on('uncaughtException', () => dat.close())
  }
}
