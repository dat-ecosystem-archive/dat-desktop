var mirror = require('mirror-folder')
var xtend = Object.assign

module.exports = inspectModel

function inspectModel (state, bus) {
  var update = bus.emit.bind(bus, 'render')

  state.inspect = xtend({}, state.inspect, {
    show: false
  })

  bus.on('dats:inspect', function (dat) {
    state.inspect.show = true
    state.inspect.dat = dat

    update()
    dat.stats.on('update', update)

    if (!dat.files) {
      dat.files = []
      var fs = { name: '/', fs: dat.archive }
      var progress = mirror(fs, '/', { dryRun: true })
      progress.on('put', function (file) {
        file.name = file.name.slice(1)
        if (file.name === '') return
        dat.files.push({
          path: file.name,
          stat: file.stat
        })
        dat.files.sort(function (a, b) {
          return a.path.localeCompare(b.path)
        })
        update()
      })
    }
  })

  bus.on('inspect:hide', function () {
    state.inspect.dat = null
    state.inspect.show = false
    bus.emit('render')
  })
}
