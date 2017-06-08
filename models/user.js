var Registry = require('dat-registry')
var xtend = Object.assign

var registry = Registry()

module.exports = userModel

function userModel (state, bus) {
  state.user = xtend(state.user || {}, {
    showLogin: false
  })

  bus.on('user:login', function () {
    state.user.showLogin = true
    bus.emit('render')
  })

  bus.on('user:login!', function (data) {
    registry.login(data, function (err, user) {
      console.log({ err, user })
    })
  })
}
