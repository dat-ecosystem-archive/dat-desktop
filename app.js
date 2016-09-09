'use strict'

const level = require('level')
const hyperdrive = require('hyperdrive')
const {app, process: remoteProcess, dialog} = require('electron').remote
const {ipcRenderer: ipc, clipboard} = require('electron')
const fs = require('fs')
const yo = require('yo-yo')
const bytewise = require('bytewise')
const liveStream = require('level-live-stream')
const render = require('./lib/render')
const minimist = require('minimist')
const exec = require('child_process').exec
const raf = require('random-access-file')
const encoding = require('dat-encoding')
const swarm = require('hyperdrive-archive-swarm')
const hyperImport = require('hyperdrive-import-files')
const rmrf = require('rimraf')
const assert = require('assert')
const jsAlert = require('js-alert')
const collect = require('collect-stream')

const argv = minimist(remoteProcess.argv.slice(2))
const root = argv.data || `${app.getPath('downloads')}/dat`
try { fs.mkdirSync(root) } catch (_) {}

const db = level(`${root}/.db`, {
  keyEncoding: bytewise,
  valueEncoding: 'json'
})
const drive = hyperdrive(db)

const archives = new Map()
let el

function encode (key) {
  return key.toString('hex')
}

const createArchive = ({ path, key, isFile }) => {
  const archive = drive.createArchive(key, {
    live: true,
    file: name => raf(isFile
      ? archive.path
      : `${archive.path}/${name}`)
  })
  archive.path = path
  return archive
}

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
      const link = `${encode(dat.key)}`
      clipboard.writeText(link)
      jsAlert.alert(yo`
        <div>
          <p>Your dat link:</p>
          <p>${link}</p>
          <p>This link has also been copied to the clipboard for your convenience.</p>
        </div>
      `.outerHTML)
    },
    delete: dat => {
      db.del(['archive', encode(dat.key)], err => {
        if (err) throw err
      })
    },
    create: () => {
      const files = dialog.showOpenDialog({
        properties: ['openFile', 'openDirectory']
      })
      if (!files.length) return
      const target = files[0]
      fs.stat(target, (err, stat) => {
        if (err) throw err

        const archive = createArchive({
          isFile: stat.isFile(),
          path: target
        })
        hyperImport(archive, target, err => {
          if (err) throw err
          archive.finalize(err => {
            if (err) throw err

            const link = encode(archive.key)
            db.put(['archive', link], {
              key: link,
              path: target,
              isFile: stat.isFile()
            })
          })
        })
      })
    },
    download: link => {
      db.put(['archive', link], {
        key: link,
        path: `${root}/${link}`
      })
    }
  })
  if (el) el = yo.update(el, fresh)
  else el = fresh
}

liveStream(db, {
  gt: ['archive', null],
  lt: ['archive', undefined]
}).on('data', data => {
  if (data.type === 'del') {
    // TODO delete archive from hyperdrive
    // TODO close swarm
    const key = data.key[1]
    const dat = archives.get(key)
    archives.delete(key)
    refresh()
    dat.listStream.destroy()
    if (dat.path.indexOf(root) > -1) {
      rmrf(dat.path, err => {
        if (err) throw err
      })
    }
  } else {
    const archive = createArchive(data.value)
    archive.open(refresh)
    archive.swarm = swarm(archive)
    archive.swarm.on('connection', peer => {
      refresh()
      peer.on('close', () => refresh())
    })
    archive.on('downloaded', () => refresh())
    archive.listStream = archive.list({ live: true })
    archive.listStream.on('data', entry => {
      if (entry.name != 'dat.json') return
      collect(archive.createFileReadStream('dat.json'), (err, raw) => {
        if (err) return
        const json = JSON.parse(raw.toString())
        archive.title = json.title
        refresh()
      })
    })
    archive.progress = 0.5

    archives.set(encode(archive.key), archive)
  }
  refresh()
})

refresh()
document.body.appendChild(el)

ipc.on('link', (ev, url) => {
  const key = encoding.decode(url)
  const encoded = encode(key)
  db.put(['archive', link], {
    key: encode(key),
    path: `${root}/${encode(key)}`
  })
})

ipc.send('ready')
