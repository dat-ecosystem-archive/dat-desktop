var xtend = Object.assign

module.exports = welcomeModel

function welcomeModel (state, bus) {
  state.welcome = xtend({
    show: false
  }, state.welcome)

  bus.on('repos loaded', function () {
    if (state.repos.values.length) return
    state.welcome.show = true
    bus.emit('render')
  })

  bus.on('hide welcome screen', function () {
    state.welcome.show = false
    bus.emit('render')
  })
}
