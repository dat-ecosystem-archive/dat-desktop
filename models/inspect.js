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
  })

  bus.on('inspect:hide', function () {
    state.inspect.dat = null
    state.inspect.show = false
    bus.emit('render')
  })
}
