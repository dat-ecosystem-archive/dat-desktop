const dialog = require('electron').remote.dialog
const clipboard = require('electron').clipboard
const ipc = require('electron').ipcRenderer
const exec = require('child_process').exec
const encoding = require('dat-encoding')
const Model = require('choo-model')

const Manager = require('../lib/dat-manager')

module.exports = createModel

function createModel (cb) {
  const model = Model('app')

  const manager = new Manager()

  model.subscription('manager', (send, done) => {
    manager.on('update', () => {
      send('app:updateArchives', manager.get(), done)
    })
  })

  model.reducer('updateArchives', (state, data) => {
    return {
      updateIndex: state.updateIndex + 1,
      archives: data
    }
  })

  // we're setting the updateIndex to force refreshes because the underlying
  // data structure is mutable
  model.state({
    updateIndex: 0,
    archives: []
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
    manager.remove(dat, done)
  })

  // copy a dat share link to clipboard and open a modal
  model.effect('share', (state, data, send, done) => {
    const dat = data
    const encodedKey = encoding.encode(dat.key)
    clipboard.writeText(`dat://${encodedKey}`)
    send('location:set', `?modal=${encodedKey}`, done)
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
