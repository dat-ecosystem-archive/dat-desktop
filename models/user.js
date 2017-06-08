var xtend = Object.assign

module.exports = userModel

function userModel (state, bus) {
  state.user = xtend(state.user || {}, {
    showLogin: false
  })

  bus.on('user:login', function () {
    state.user.showLogin = true
    bus.emit('render')
  })
}
