var Registry = require('dat-registry')
var xtend = Object.assign

var registry = Registry()

module.exports = userModel

function userModel (state, bus) {
  state.user = state.user || {}
  state.user = xtend(state.user, {
    show: null,
    loginError: null,
    registerError: null,
    session: state.user.session
  })

  bus.on('user:login', function () {
    state.user.show = 'login'
    bus.emit('render')
  })

  bus.on('user:login!', function (data) {
    registry.login(data, function (err, res, session) {
      if (err) {
        state.user.loginError = err
        bus.emit('render')
        return
      }
      state.user.show = null
      state.user.session = session
      bus.emit('render')
    })
  })

  bus.on('user:register', function () {
    state.user.show = 'register'
    bus.emit('render')
  })

  bus.on('user:register!', function (data) {
    registry.register(data, function (err, res, session) {
      if (err) {
        state.user.registerError = err
        bus.emit('render')
        return
      }
      state.user.show = null
      state.user.session = session
      bus.emit('render')
    })
  })
}
