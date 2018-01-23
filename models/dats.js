const remoteProcess = require('electron').remote.process
const dialog = require('electron').remote.dialog
const ipc = require('electron').ipcRenderer
const waterfall = require('run-waterfall')
const app = require('electron').remote.app
const encoding = require('dat-encoding')
const shell = require('electron').shell
const Multidat = require('multidat')
const minimist = require('minimist')
const toilet = require('toiletdb')
const mkdirp = require('mkdirp')
const assert = require('assert')
const Dat = require('dat-node')
const xtend = require('xtend')
const path = require('path')
const os = require('os')

const Modal = require('../elements/modal')
const createManager = require('../lib/dat-manager')
var datJson = require('../lib/dat-json')

var argv = minimist(remoteProcess.argv.slice(2))
var downloadsDir = (argv.data)
  ? argv.data
  : path.join(app.getPath('downloads'), '/dat')

module.exports = datsModel

function showOpenDialog () {
  if (process.env.TEST_OPEN_DIALOG_RESULT) {
    return [process.env.TEST_OPEN_DIALOG_RESULT]
  }
  return dialog.showOpenDialog({
    properties: ['openDirectory']
  })
}

function datsModel (state, bus) {
  state.dats = xtend({
    downloadsDir: downloadsDir,
    removalKey: null,
    ready: false,
    values: [],
    speed: { up: 0, down: 0 }
  }, state.dats)

  var manager = null

  function onerror (err) {
    if (err) bus.emit('error', err)
  }

  // boot multidat, create the ~/Downloads/dat directory
  var dbLocation = argv.db || path.join(os.homedir(), '.dat-desktop')
  var dbMultidriveFile = path.join(dbLocation, 'dats.json')
  var dbPausedFile = path.join(dbLocation, 'paused.json')
  var dbMultidrive, dbPaused

  var tasks = [
    function (next) {
      mkdirp(dbLocation, next)
    },
    function (_, next) {
      mkdirp(downloadsDir, next)
    },
    function (_, next) {
      dbMultidrive = toilet(dbMultidriveFile)
      dbMultidrive.open(next)
    },
    function (next) {
      dbPaused = toilet(dbPausedFile)
      dbPaused.open(next)
    },
    function (next) {
      Multidat(dbMultidrive, { dat: Dat }, next)
    },
    function (multidat, done) {
      manager = createManager({
        multidat,
        dbPaused
      }, function (err, dats, speed) {
        if (err) return bus.emit('error', err)
        state.dats.values = dats
        state.dats.speed = speed
        state.dats.ready = true
        bus.emit('render')
      })
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
      var files = showOpenDialog()
      if (!files || !files.length) return
      pathname = files[0]
    }
    manager.create(pathname, onerror)
  })

  bus.on('dats:clone', function ({ key, location }) {
    cloneDat({ key, location })
  })

  ipc.on('link', function (event, url) {
    bus.emit('dats:download', url)
  })

  function cloneDat ({ key: _key, location }) {
    try {
      var key = encoding.toStr(_key)
    } catch (e) {
      return onerror(new Error("The value you entered doesn't appear to be a valid Dat link"))
    }

    var opts = { key }
    var dir = path.join(location, key)
    manager.create(dir, opts, onerror)
  }

  // copy a dat share link to clipboard and open a modal
  bus.on('dats:share', function (dat) {
    assert.ok(dat.key, 'dats-model.shareDat: data.key should exist')
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

  bus.on('dats:update-title', function (data) {
    assert.equal(typeof data, 'object', 'dats:update-title: data should be type object')
    assert.equal(typeof data.key, 'string', 'dats:update-title: data.key should be type string')
    assert.equal(typeof data.title, 'string', 'dats:update-title: data.title should be type string')

    var newTitle = data.title
    var key = data.key
    var dat = state.dats.values.find(function (dat) {
      return dat.key.toString('hex') === key
    })
    assert.ok(dat, 'dats:update-title: no dat found for key ' + key)

    var values = Object.assign({}, dat.metadata, { title: newTitle })
    var edit = datJson(dat)
    edit.write(values, function (err) {
      if (err) return onerror(err)
      bus.emit('render')
    })
  })

  // handle IPC events from the server
  ipc.on('log', (ev, str) => console.log(str))
  ipc.send('ready')
}
