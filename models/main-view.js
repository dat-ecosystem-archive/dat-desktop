var assert = require('assert')

module.exports = createModel

function createModel (cb) {
  return {
    namespace: 'mainView',
    effects: {
      loadWelcomeScreenPerhaps: loadWelcomeScreenPerhaps
    },
    state: {
      welcome: true
    },
    reducers: {
      toggleWelcomeScreen: toggleWelcomeScreen
    }
  }
}

function loadWelcomeScreenPerhaps (state, action, send, done) {
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
