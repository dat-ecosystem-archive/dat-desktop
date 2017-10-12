const nanobus = require('nanobus')
const path = require('path')
const minimist = require('minimist')
const fs = require('fs')
const net = require('net')
const explain = require('explain-error')

const bus = nanobus()
const state = {}
const argv = minimist(process.argv.slice(2))
const config = {
  socket: '../dats.sock'
}
const downloadsDir = (argv.data)
  ? argv.data
  : path.join('./downloads', '/dat') // @TODO daemon config

require('../models/dats')({dbLocation: argv.db, downloadsDir: downloadsDir})(state, bus)
require('../models/download')(state, bus)

bus.once('dats:manager', function (manager) {
  daemon(manager)
})

process.on('unhandledException', function (err) {
  if (err._thrown) return
  err._thrown = true
  throw err
})

function daemon (manager) {
  try {
    fs.unlinkSync(config.socket)
  } catch (e) {}

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
            manager.create(directory, function (err, dat) {
              if (err) return bus.emit('error', err)
              socket.end(`dat://${dat.key.toString('hex')}\n`)
            })
          })

          break
        case 'list':
          state.dats.values.forEach((e) => {
            socket.write(`dat://${e.key.toString('hex')}\n`)
          })

          socket.end()
          break
        case 'remove':
          const key = data[1]

          if (!key) {
            socket.end('no key.')
            return
          }

          manager.close(key, function (err) {
            if (err) return bus.emit('error', err)
            bus.emit('render')
            socket.end(`${key} removed`)
          })

          break
        default:
          socket.write(`command "${command}" not found.`)
      }
    })
  }).listen(config.socket)
}
