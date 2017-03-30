var xtend = Object.assign

module.exports = welcomeModel

function welcomeModel (state, bus) {
  state.welcome = xtend({
    show: false
  }, state.welcome)

  bus.on('dats:loaded', function () {
    if (state.repos.values.length) return
    state.welcome.show = true
    bus.emit('render')
  })

  bus.on('welcome:hide', function () {
    state.welcome.show = false
    bus.emit('render')
  })
}
