const ipc = require('electron').ipcRenderer
const hyperdrive = require('hyperdrive')
const encoding = require('dat-encoding')
const bulk = require('bulk-require')
const mount = require('choo/mount')
const log = require('choo-log')
const choo = require('choo')
const fs = require('fs')

const createArchive = require('./lib/create-archive')
const RootDir = require('./lib/get-root-dir')
const mainView = require('./pages/main')
const Db = require('./lib/db')

const rootDir = RootDir()
try { fs.mkdirSync(rootDir) } catch (_) {}
const db = Db(rootDir)
const drive = hyperdrive(db)

const opts = { rootDir, db, drive, createArchive }
const app = choo()
app.use(log())

// import & init models
const globs = bulk(__dirname, [ 'models/*' ])
Object.keys(globs).forEach((globname) => {
  const globmatch = globs[globname]
  Object.keys(globmatch).forEach((key) => app.model(globmatch[key](opts)))
})

// start
app.router(['/', (state, prev, send) => mainView(state.app)])
mount('body', app.start())

// initialize IPC stuff
// TODO(yw): move to model
ipc.on('link', (ev, url) => {
  const key = encoding.decode(url)
  db.put(['archive', key], {
    path: `${rootDir}/${encoding.encode(key)}`
  })
})

ipc.send('ready')
