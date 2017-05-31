var tmpdir = require('os').tmpdir
var Dat = require('dat-node')
var xtend = Object.assign

module.exports = downloadModel

function downloadModel (state, bus) {
  var update = bus.emit.bind(bus, 'render')

  state.download = xtend({}, state.download, {
    show: false,
    dat: null
  })

  bus.on('dats:download', function (key) {
    state.download.show = true
    state.download.key = key
    if (state.download.dat) {
      state.download.dat.close()
      state.download.dat = null
    }
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

      dat.archive.on('content', update)
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
