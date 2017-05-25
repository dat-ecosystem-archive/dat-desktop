var join = require('path').join
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
    }
  })

  bus.on('inspect:hide', function () {
    state.inspect.dat = null
    state.inspect.show = false
    bus.emit('render')
  })
}
