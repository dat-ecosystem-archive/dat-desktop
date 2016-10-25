'use strict'

const level = require('level')
const hyperdrive = require('hyperdrive')
const {app, process: remoteProcess, dialog} = require('electron').remote
const {ipcRenderer: ipc, clipboard} = require('electron')
const fs = require('fs')
const yo = require('yo-yo')
const bytewise = require('bytewise')
const render = require('./elements/render')
const minimist = require('minimist')
const exec = require('child_process').exec
const encoding = require('dat-encoding')
const hyperImport = require('hyperdrive-import-files')
const jsAlert = require('js-alert')
const argv = minimist(remoteProcess.argv.slice(2))

const createArchive = require('./lib/create-archive')
const liveStream = require('./lib/live-stream')

const root = argv.data || `${app.getPath('downloads')}/dat`
try { fs.mkdirSync(root) } catch (_) {}

const db = level(`${root}/.db`, {
  keyEncoding: bytewise,
  valueEncoding: 'json'
})
const drive = hyperdrive(db)

const archives = new Map()
let el

liveStream(db, archives, drive, createArchive, refresh)
refresh()
document.body.appendChild(el)

ipc.on('link', (ev, url) => {
  const key = encoding.decode(url)
  db.put(['archive', key], {
    path: `${root}/${encoding.encode(key)}`
  })
})

ipc.send('ready')

// re-render the application
function refresh (err) {
  if (err) throw err
  const fresh = render({
    dats: archives,
    open: archive => {
      // TODO cross platform
      exec(`open "${archive.path}"`, err => {
        if (err) throw err
      })
    },
    share: dat => {
      const link = `dat://${encoding.encode(dat.key)}`
      clipboard.writeText(link)
      jsAlert.alert(yo`
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
    },
    delete: dat => {
      db.del(['archive', dat.key], err => {
        if (err) throw err
      })
    },
    create: () => {
      const files = dialog.showOpenDialog({
        properties: ['openFile', 'openDirectory']
      })
      if (!files || !files.length) return
      const target = files[0]
      fs.stat(target, (err, stat) => {
        if (err) throw err

        const archive = createArchive(drive, {
          isFile: stat.isFile(),
          path: target
        })
        hyperImport(archive, target, err => {
          if (err) throw err
          archive.finalize(err => {
            if (err) throw err

            db.put(['archive', archive.key], {
              path: target,
              isFile: stat.isFile()
            })
          })
        })
      })
    },
    download: link => {
      const key = encoding.decode(link)
      const path = `${root}/${encoding.encode(key)}`
      fs.mkdir(path, () => {
        db.put(['archive', key], {
          key: link,
          path: path
        })
      })
    }
  })
  if (el) el = yo.update(el, fresh)
  else el = fresh
}
