const dialog = require('electron').remote.dialog
const ipc = require('electron').ipcRenderer
const encoding = require('dat-encoding')
const debounce = require('debounce')
const Model = require('choo-model')
const open = require('open')

const Manager = require('../lib/dat-manager')

module.exports = createModel

function createModel (cb) {
  const model = Model('repos')

  const manager = new Manager()

  model.subscription('manager', (send, done) => {
    manager.on('update', debounce(() => {
      send('repos:update', manager.get(), done)
    }), 1500, true)
  })

  model.reducer('update', (state, data) => {
    return {
      updateIndex: state.updateIndex + 1,
      values: data
    }
  })

  // we're setting the updateIndex to force refreshes because the underlying
  // data structure is mutable
  model.state({
    updateIndex: 0,
    values: []
  })

  model.effect('open', (state, dat) => {
    open(dat.dir, (err) => {
      if (err) throw err
    })
  })

  model.effect('create', function create (state, data, send, done) {
    const files = dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (!files || !files.length) return
    const dir = files[0]
    send('repos:add-dir', dir, done)
  })

  model.effect('add-dir', function create (state, data, send, done) {
    var dir = data
    manager.create(dir, done)
  })

  model.effect('delete', (state, data, send, done) => {
    const dat = data
    const encodedKey = encoding.encode(dat.key)
    send('location:set', `?delete=${encodedKey}`, done)
  })

  model.effect('deleteConfirm', (state, data, send, done) => {
    const link = data
    var dats = manager.get()
    dats.map(function (dat) {
      if (encoding.encode(dat.key) === link) {
        manager.remove(dat, function () {
          window.history.back()
        })
      }
    })
  })

  // copy a dat share link to clipboard and open a modal
  model.effect('share', (state, data, send, done) => {
    const dat = data
    const encodedKey = encoding.encode(dat.key)
    send('location:set', `?share=${encodedKey}`, done)
  })

  model.effect('download', (state, data, send, done) => {
    const link = data
    manager.download(link, done)
  })

  // initialize IPC stuff
  ipc.on('link', (ev, url) => {
    const key = encoding.decode(url)
    manager.download(key, err => {
      if (err) throw err
    })
  })

  ipc.send('ready')

  ipc.on('log', (ev, str) => console.log(str))

  return model.start()
}
