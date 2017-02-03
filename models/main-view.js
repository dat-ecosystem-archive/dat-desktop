var assert = require('assert')

module.exports = createModel

function createModel (cb) {
  return {
    namespace: 'mainView',
    subscriptions: {
      start: start
    },
    effects: {
      loadWelcomeScreen: loadWelcomeScreen
    },
    state: {
      welcome: true
    },
    reducers: {
      toggleWelcomeScreen: toggleWelcomeScreen
    }
  }
}

function start (send, done) {
  send('mainView:loadWelcomeScreen', done)
}

function loadWelcomeScreen (state, action, send, done) {
  send('repos:shareState', function (err, reposState) {
    if (err) return done(err)
    if (reposState.values.length) return done()
    send('mainView:toggleWelcomeScreen', { toggle: true }, done)
  })
}

function toggleWelcomeScreen (state, data, action) {
  assert.equal(typeof data.toggle, 'boolean', 'models/main-view: toggle should be a boolean')
  return { welcome: data.toggle }
}
