var xtend = Object.assign

module.exports = mainViewModel

function mainViewModel (state, bus) {
  state.mainView = xtend({
    welcome: false
  }, state.mainView)

  bus.on('repos loaded', function () {
    if (state.repos.values.length) return
    state.mainView.welcome = true
    bus.emit('render')
  })

  bus.on('hide welcome screen', function () {
    state.mainView.welcome = false
    bus.emit('render')
  })
}
