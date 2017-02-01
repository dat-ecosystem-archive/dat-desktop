const dialog = require('electron').remote.dialog
const ipc = require('electron').ipcRenderer
const encoding = require('dat-encoding')
const debounce = require('debounce')
const open = require('open')

const Manager = require('../lib/dat-manager')

module.exports = createModel

function createModel (cb) {
  const manager = new Manager()

  ipc.on('link', (ev, url) => {
    const key = encoding.decode(url)
    manager.download(key, (err) => {
      if (err) throw err
    })
  })

  ipc.send('ready')
  ipc.on('log', (ev, str) => console.log(str))

  return {
    namespace: 'repos',
    state: {
      updateIndex: 0,
      values: []
    },
    subscriptions: {
      manager: handleManagerUpdate
    },
    reducers: {
      update: update
    },
    effects: {
      open: openDat,
      share: shareDat,
      create: createDat,
      delete: deleteDat,
      download: downloadDat,
      'add-dir': addDirectory,
      deleteConfirm: deleteConfirmed
    }
  }

  function handleManagerUpdate (send, done) {
    manager.on('update', debounce(() => {
      send('repos:update', manager.get(), done)
    }), 1500, true)
  }

  function update (state, data) {
    return {
      updateIndex: state.updateIndex + 1,
      values: data
    }
  }

  function openDat (state, dat) {
    open(dat.dir, (err) => {
      if (err) throw err
    })
  }

  function createDat (state, data, send, done) {
    const files = dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (!files || !files.length) return
    const dir = files[0]
    send('repos:add-dir', dir, done)
  }

  function addDirectory (state, data, send, done) {
    var dir = data
    manager.create(dir, done)
  }

  function deleteDat (state, data, send, done) {
    const dat = data
    const encodedKey = encoding.encode(dat.key)
    send('location:set', `?delete=${encodedKey}`, done)
  }

  function deleteConfirmed (state, data, send, done) {
    const link = data
    var dats = manager.get()
    dats.map(function (dat) {
      if (encoding.encode(dat.key) === link) {
        manager.remove(dat, function () {
          window.history.back()
        })
      }
    })
  }

  // copy a dat share link to clipboard and open a modal
  function shareDat (state, data, send, done) {
    const dat = data
    const encodedKey = encoding.encode(dat.key)
    send('locatin:set', `?share=${encodedKey}`, done)
  }

  function downloadDat (state, data, send, done) {
    const link = data
    manager.download(link, done)
  }
}
