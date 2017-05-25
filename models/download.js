var tmpdir = require('os').tmpdir
var Dat = require('dat-node')
var xtend = Object.assign
var join = require('path').join

module.exports = downloadModel

function downloadModel (state, bus) {
  var update = bus.emit.bind(bus, 'render')

  state.download = xtend({}, state.download, {
    show: false
  })

  bus.on('dats:download', function (key) {
    state.download.show = true
    state.download.key = key
    update()

    var dir = `${tmpdir()}/${Date.now()}`
    Dat(dir, {
      key,
      sparse: true
    }, function (err, dat) {
      if (err) {
        state.download.err = err
        return
      }
      state.download.dat = dat

      dat.joinNetwork()
      dat.network.on('connection', function (connection) {
        update()
        connection.on('close', update)
      })

      dat.trackStats()
      dat.stats.on('update', update)

      dat.archive.readFile('dat.json', function (err, buf) {
        if (err) return
        try {
          dat.metadata = JSON.parse(buf)
        } catch (_) {
          return
        }
        update()
      })

      dat.archive.on('content', function () {
        update()
        dat.files = []

        function sort () {
          dat.files.sort(function (a, b) {
            return a.path.localeCompare(b.path)
          })
        }

        function walk (dir) {
          dat.archive.readdir(dir, function (err, names) {
            if (err) return
            names.forEach(function (name) {
              var file = { path: join(dir, name) }
              dat.files.push(file)
              sort()
              dat.archive.stat(file.path, function (err, stat) {
                if (err) return
                file.stat = stat
                if (stat.isDirectory()) {
                  file.path += '/'
                  walk(file.path)
                }
                sort()
                update()
              })
            })
            update()
          })
        }
        walk('')
      })

      dat.archive.ready(update)
      update()
    })
  })

  bus.on('download:hide', function () {
    state.download.dat.close()
    state.download.dat = null
    state.download.show = false
    state.download.key = null
    bus.emit('render')
  })
}
