const dialog = require('electron').remote.dialog
const clipboard = require('electron').clipboard
const exec = require('child_process').exec
const encoding = require('dat-encoding')
const jsAlert = require('js-alert')
const html = require('choo/html')
const assert = require('assert')
const fs = require('fs')

const liveStream = require('../lib/live-stream')
const Model = require('../lib/create-model')

module.exports = createModel

function createModel (opts) {
  assert.ok(opts.createArchive, 'models/app: createArchive is not defined')
  assert.ok(opts.db, 'models/app: db is not defined')

  const model = Model('app')
  const archives = {}

  // we're setting the updateIndex to force refreshes because the underlying
  // data structure is mutable
  model.state({
    updateIndex: 0,
    archives: archives
  })

  model.subscription('livestream', (send, done) => {
    liveStream(opts, archives, () => {
      send('app:updateArchives', Object.keys(archives).reduce((acc, key) => {
        const archive = archives[key]
        acc[key] = {
          key: archive.key,
          title: archive.title,
          owner: archive.owner,
          progress: archive.progress,
          stats: {
            peers: archive.stats.peers,
            bytesTotal: archive.stats.bytesTotal
          },
          archive: {
            downloaded: archive.archive && archive.archive.downloaded
          }
        }
        return acc
      }, {}), done)
    })
  })

  model.reducer('updateArchives', (state, data) => {
    return { updateIndex: state.updateIndex + 1 }
  })

  model.effect('open', (state, data) => {
    // TODO(jg): cross platform
    const archive = data
    exec(`open "${archive.path}"`, err => {
      if (err) throw err
    })
  })
  model.effect('create', function create (state, data, send, done) {
    const files = dialog.showOpenDialog({
      properties: ['openFile', 'openDirectory']
    })
    if (!files || !files.length) return
    const target = files[0]
    fs.stat(target, (err, stat) => {
      if (err) throw err

      const archive = opts.createArchive({ path: target })
      archive.open(err => {
        if (err) throw err
        archive.close(err => {
          if (err) throw err
          // TODO https://github.com/joehand/dat-js/issues/18
          archive.db.close(err => {
            if (err) throw err

            opts.db.put(['archive', archive.key], {
              path: target,
              key: encoding.encode(archive.key),
              owner: true
            })
          })
        })
      })
    })
  })
  model.effect('delete', (state, data, send, done) => {
    const dat = data
    opts.db.del(['archive', dat.key], err => {
      if (err) throw err
    })
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
    const key = encoding.decode(link)
    const path = `${opts.rootDir}/${encoding.encode(key)}`
    fs.mkdir(path, () => {
      opts.db.put(['archive', key], {
        key: link,
        path: path
      })
      done()
    })
  })

  return model.start()
}
