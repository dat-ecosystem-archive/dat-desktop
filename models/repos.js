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
const mkdirp = require('mkdirp')
const assert = require('assert')
const xtend = require('xtend')
const path = require('path')

const Modal = require('../elements/modal')
const createManager = require('../lib/dat-manager')

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
      Multidat(dbMultidrive, {
        dat: Worker,
        stdout: ConsoleStream(),
        stderr: ConsoleStream()
      }, next)
    },
    function (multidat, done) {
      var dbPaused = toilet(dbPausedFile)
      manager = createManager({
        multidat,
        dbPaused
      }, function (err, dats) {
        if (err) return bus.emit('error', err)
        state.repos.values = dats
        state.repos.ready = true
        bus.emit('render')
      })
      window.addEventListener('beforeunload', onBeforeUnload)
      function onBeforeUnload (ev) {
        ev.returnValue = false
        window.removeEventListener('beforeunload', onBeforeUnload)
        manager.closeAll(function () {
          app.quit()
        })
      }
      bus.emit('dats:loaded')
      done()
    }
  ]

  waterfall(tasks, onerror)

  // open the dat archive in the native filesystem explorer
  bus.on('dats:open', function (dat) {
    var pathname = 'file://' + path.resolve(dat.path)
    shell.openExternal(pathname, onerror)
  })

  // choose a directory and convert it to a dat archive
  bus.on('dats:create', function (pathname) {
    if (!pathname) {
      var files = dialog.showOpenDialog({
        properties: ['openDirectory']
      })
      if (!files || !files.length) return
      pathname = files[0]
    }
    manager.create(pathname, onerror)
  })

  bus.on('dats:clone', function (key) {
    cloneDat(key)
  })
  ipc.on('link', function (event, url) {
    cloneDat(url)
  })

  function cloneDat (_key) {
    try {
      var key = encoding.toStr(_key)
    } catch (e) {
      return onerror(new Error("The value you entered doesn't appear to be a valid Dat link"))
    }

    var dir = path.join(state.repos.downloadsDir, key)
    var opts = { key: key }
    manager.create(dir, opts, onerror)
  }

  // copy a dat share link to clipboard and open a modal
  bus.on('dats:share', function (dat) {
    assert.ok(dat.key, 'repos-model.shareDat: data.key should exist')
    const encodedKey = encoding.toStr(dat.key)
    const modal = Modal.link()(encodedKey)
    document.body.appendChild(modal)
  })

  bus.on('dats:toggle-pause', function (dat) {
    manager.togglePause(dat, onerror)
  })

  bus.on('dats:remove', function (dat) {
    const modal = Modal.confirm()(function () {
      manager.close(dat.key, function (err) {
        if (err) return onerror(err)
        bus.emit('render')
      })
    })
    document.body.appendChild(modal)
  })

  // handle IPC events from the server
  ipc.on('log', (ev, str) => console.log(str))
  ipc.send('ready')
}
