var Registry = require('dat-registry')
var xtend = Object.assign

var registry = Registry()

module.exports = userModel

function userModel (state, bus) {
  state.user = xtend(state.user || {}, {
    show: null,
    loginError: null,
    registerError: null
  })

  bus.on('user:login', function () {
    state.user.show = 'login'
    bus.emit('render')
  })

  bus.on('user:login!', function (data) {
    registry.login(data, function (err, user) {
      if (err) {
        state.user.loginError = err
        bus.emit('render')
        return
      }
      console.log({ err, user })
    })
  })

  bus.on('user:register', function () {
    state.user.show = 'register'
    bus.emit('render')
  })

  bus.on('user:register!', function (data) {
    registry.register(data, function (err, user) {
      if (err) {
        state.user.registerError = err
        bus.emit('render')
        return
      }
    })
  })
}
