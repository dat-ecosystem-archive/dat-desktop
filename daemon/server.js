const nanobus = require('nanobus')
const path = require('path')
const minimist = require('minimist')
const fs = require('fs')
const net = require('net')
const explain = require('explain-error')
const ToiletDbAsync = require('../lib/toiletdb-async')
const List = require('../lib/dat-list')
const config = require('../config')()

const bus = nanobus()
const state = {}

require('../models/dats')({dbLocation: config.metadata, downloadsDir: config.downloadsDir})(state, bus)
require('../models/download')(state, bus)

bus.once('dats:manager', async function (manager) {
  daemon(manager)
})

async function daemon (manager) {
  try {
    fs.unlinkSync(config.socket)
  } catch (e) {}

  const list = new List(await ToiletDbAsync(config.list), manager)
  await list.share(config.dirList)

  net.createServer((socket) => {
    bus.on('error', function (err) {
      socket.end(err.message || err)
    })

    socket.on('data', (data) => {
      data = data.toString().split(' ')
      const command = data[0]

      switch (command) {
        case 'create':
          const directory = data[1]

          fs.stat(directory, (err, stat) => {
            if (err) return bus.emit('error', explain(err, 'models/window: fs.stat error on dirname'))
            if (!stat.isDirectory()) return bus.emit('error', 'Path is not a directory')
            manager.create(directory, async function (err, dat) {
              if (err) return bus.emit('error', err)
              socket.end(`dat://${dat.key.toString('hex')}\n`)
              await list.save()
            })
          })

          break
        case 'list':
          socket.write(`List available through dat://${list.key}\n`)

          list.list.forEach((e) => {
            socket.write(`dat://${e}\n`)
          })

          socket.end()
          break
        case 'remove':
          const key = data[1]

          if (!key) {
            socket.end('no key.')
            return
          }

          manager.close(key, async function (err) {
            if (err) return bus.emit('error', err)
            bus.emit('render')
            socket.end(`${key} removed`)
            await list.save()
          })

          break
        default:
          socket.write(`command "${command}" not found.`)
      }
    })
  }).listen(config.socket)
}

process.on('unhandledException', function (err) {
  if (err._thrown) return
  err._thrown = true
  throw err
})
