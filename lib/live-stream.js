const assert = require('assert')
const encoding = require('dat-encoding')
const collect = require('collect-stream')
const rmrf = require('rimraf')
const liveStream = require('level-live-stream')
const fs = require('fs')

module.exports = streamData

// stream data from dats into the local filesystem
// (obj, map, fn) -> null
function streamData (args, archives, cb) {
  assert.ok(args.createArchive, 'lib/live-stream: createArchive is not defined')
  assert.ok(archives, 'lib/live-stream: archives is not defined')
  assert.ok(args.db, 'lib/live-stream: db is not defined')
  assert.ok(cb, 'lib/live-stream: cb is not defined')

  liveStream(args.db, {
    gt: ['archive', null],
    lt: ['archive', undefined]
  }).on('data', data => {
    const key = data.key[1]
    const link = encoding.encode(key)

    if (data.type === 'del') {
      // TODO delete archive from hyperdrive
      // TODO close swarm
      const dat = archives[link]
      delete archives[link]
      cb()
      dat.listStream.destroy()
      if (dat.path.indexOf(root) > -1) {
        rmrf(dat.path, err => {
          if (err) throw err
        })
      }
    } else {
      const path = `${root}/${link}`
      fs.mkdir(path, () => {
        const archive = args.createArchive(Object.assign({ key }, data.value))
        archive.download(err => {
          cb()
          if (err) throw err
        })
        archive.share(err => {
          cb()
          // TODO control flow
          if (err) throw err

          // TODO add to dat-js https://github.com/joehand/dat-js/issues/30
          archive.listStream = archive.archive.list({ live: true })
          archive.listStream.on('data', entry => {
            if (entry.name !== 'dat.json') return
            collect(archive.createFileReadStream('dat.json'), (err, raw) => {
              if (err) return
              const json = JSON.parse(raw.toString())
              archive.title = json.title
              cb()
            })
          })
        })

        archive.on('key', () => cb())
        archive.on('files-counted', () => cb())
        archive.on('archive-finalized', () => cb())
        archive.on('archive-updated', () => cb())
        archive.on('download-finished', () => cb())
        archive.on('swarm-update', () => cb())
        archive.progress = 0.5

        archives[link] = archive
      })
    }
    cb()
  })
}
