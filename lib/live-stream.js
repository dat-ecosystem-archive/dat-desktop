const assert = require('assert')
const encoding = require('dat-encoding')
const collect = require('collect-stream')
const rmrf = require('rimraf')
const swarm = require('hyperdrive-archive-swarm')
const liveStream = require('level-live-stream')
const fs = require('fs')

module.exports = streamData

// stream data from dats into the local filesystem
// (obj, map, fn) -> null
function streamData (args, archives, cb) {
  assert.ok(args.createArchive, 'lib/live-stream: createArchive is not defined')
  assert.ok(archives, 'lib/live-stream: archives is not defined')
  assert.ok(args.drive, 'lib/live-stream: drive is not defined')
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
      const dat = archives.get(link)
      archives.delete(link)
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
        const archive = args.createArchive(args.drive, Object.assign({ key }, data.value))
        archive.open(cb)
        archive.swarm = swarm(archive)
        archive.swarm.on('connection', peer => {
          cb()
          peer.on('close', () => cb())
        })
        archive.on('download', () => cb())
        archive.on('content', () => cb())
        archive.listStream = archive.list({ live: true })
        archive.listStream.on('data', entry => {
          if (entry.name !== 'dat.json') return
          collect(archive.createFileReadStream('dat.json'), (err, raw) => {
            if (err) return
            const json = JSON.parse(raw.toString())
            archive.title = json.title
            cb()
          })
        })
        archive.progress = 0.5

        archives.set(link, archive)
      })
    }
    cb()
  })
}
