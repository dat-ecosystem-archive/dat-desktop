const dialog = require('electron').remote.dialog
const clipboard = require('electron').clipboard
const ipc = require('electron').ipcRenderer
const exec = require('child_process').exec
const encoding = require('dat-encoding')
const jsAlert = require('js-alert')
const html = require('choo/html')
const assert = require('assert')
const fs = require('fs')
const Manager = require('../lib/manage-dats')

const Model = require('../lib/create-model')
const rootDir = require('../lib/root-dir')

module.exports = createModel

function createModel (cb) {
  const model = Model('app')

  const manager = Manager()

  model.subscription('manager', (send, done) => {
    manager.events.on('update', () => {
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
    manager.deleteDat(dat, done)
  })
  model.effect('share', (state, data, send, done) => {
    const dat = data
    const link = `dat://${encoding.encode(dat.key)}`
    clipboard.writeText(link)
    jsAlert.alert(html`
      <div>
        <p>Your dat link:</p>
        <p>
          <input type="text" value=${link}/>
        </p>
        <p>
          This link has also been copied to the clipboard for your
          convenience.
        </p>
      </div>
    `.outerHTML)
  })
  model.effect('download', (state, data, send, done) => {
    const link = data
    manager.importDat(link, done)
  })

  // initialize IPC stuff
  ipc.on('link', (ev, url) => {
    const key = encoding.decode(url)
    manager.importDat(key, err => {
      if (err) throw err
    })
  })

  ipc.send('ready')

  return model.start()
}
