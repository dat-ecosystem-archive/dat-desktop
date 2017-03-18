const Archiver = require('hypercore-archiver')
const remoteProcess = require('electron').remote.process
const minimist = require('minimist')
const waterfall = require('run-waterfall')
const mkdirp = require('mkdirp')
const app = require('electron').remote.app
const path = require('path')
const Server = require('archiver-server')

module.exports = createModel

function createModel (params) {
  if (!params) params = {}
  let archiver = null
  let server = null
  const argv = minimist(remoteProcess.argv.slice(2))
  const dbLocation = argv.db || path.join(process.env.HOME, '.dat-desktop')
  const dir = path.join(dbLocation, 'archiver')

  return {
    namespace: 'archiver',
    state: {
      dir: dir
    },
    subscriptions: {
      start: createArchiver
    },
    effects: {
      add: add,
      remove: remove,
      list: list
    }
  }

  function createArchiver (send, done) {
    const tasks = [
      function (next) {
        mkdirp(dir, next)
      },
      function () {
        archiver = Archiver({dir: dir})
        server = Server(archiver, {swarm: true})
        app.on('before-quit', function () {
          server.swarm.destroy()
        })
      }
    ]
    waterfall(tasks, done)
  }

  function add (state, data, send, done) {
    archiver.add(data.key, done)
  }

  function remove (state, data, send, done) {
    archiver.remove(data.key, done)
  }

  function list (state, data, send, done) {
    archiver.list(done)
  }
}
