'use strict'

const {app, process: remoteProcess} = require('electron').remote
const ipc = require('electron').ipcRenderer
const hyperdrive = require('hyperdrive')
const encoding = require('dat-encoding')
const bytewise = require('bytewise')
const minimist = require('minimist')
const level = require('level')
const yo = require('yo-yo')
const fs = require('fs')

const createArchive = require('./lib/create-archive')
const liveStream = require('./lib/live-stream')
const AppModel = require('./models/app')
const render = require('./pages/main')

const argv = minimist(remoteProcess.argv.slice(2))
const rootDir = argv.data || `${app.getPath('downloads')}/dat`
try { fs.mkdirSync(rootDir) } catch (_) {}

const db = level(`${rootDir}/.db`, {
  keyEncoding: bytewise,
  valueEncoding: 'json'
})
const drive = hyperdrive(db)

const archives = new Map()

const appModel = AppModel(rootDir, db, archives, drive, createArchive)
const createProps = appModel.reducers.update
let el

liveStream(db, archives, drive, createArchive, refresh)
refresh()
document.body.appendChild(el)

ipc.on('link', (ev, url) => {
  const key = encoding.decode(url)
  db.put(['archive', key], {
    path: `${rootDir}/${encoding.encode(key)}`
  })
})

ipc.send('ready')

// re-render the application
function refresh (err) {
  if (err) throw err
  const props = createProps()
  const fresh = render(props)
  if (el) el = yo.update(el, fresh)
  else el = fresh
}
