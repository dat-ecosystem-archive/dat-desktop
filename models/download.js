var tmpdir = require('os').tmpdir
var Dat = require('dat-node')
var xtend = Object.assign

module.exports = downloadModel

function downloadModel (state, bus) {
  var update = bus.emit.bind(bus, 'render')

  state.download = xtend(state.download, {
    show: false
  })

  bus.on('dats:download', function (link) {
    state.download.show = true
    state.download.link = link
    update()

    var dir = `${tmpdir()}/${Date.now()}`
    Dat(dir, {
      key: link,
      sparse: true
    }, function (err, dat) {
      if (err) return state.download.err = err
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

      dat.archive.ready(update)
      dat.archive.on('content', update)

      update()
    })
  })

  bus.on('download:cancel', function (link) {
    state.download.dat.close()
    state.download.dat = null
    state.download.show = false
    state.download.link = null
    bus.emit('render')
  })
}
