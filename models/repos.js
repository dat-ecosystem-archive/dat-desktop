const dialog = require('electron').remote.dialog
const ipc = require('electron').ipcRenderer
const exec = require('child_process').exec
const encoding = require('dat-encoding')
const Model = require('choo-model')

const Manager = require('../lib/dat-manager')

module.exports = createModel

function createModel (cb) {
  const model = Model('repos')

  const manager = new Manager()

  model.subscription('manager', (send, done) => {
    manager.on('update', () => {
      send('repos:update', manager.get(), done)
    })
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
    // TODO cross platform
    exec(`open "${dat.dir}"`, err => {
      if (err) throw err
    })
  })

  model.effect('create', function create (state, data, send, done) {
    const files = dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (!files || !files.length) return
    const dir = files[0]
    manager.create(dir, done)
  })

  model.effect('delete', (state, data, send, done) => {
    const dat = data
    const encodedKey = encoding.encode(dat.key)
    send('location:set', `?delete=${encodedKey}`, done)
  })

  model.effect('delete', (state, data, send, done) => {
    const link = link
    var dats = manager.get()
    dats.map(function (dat) {
      if (dat.key === link) manager.remove(dat, done)
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

  return model.start()
}
