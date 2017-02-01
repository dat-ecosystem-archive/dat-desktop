module.exports = createModel

function createModel (cb) {
  return {
    namespace: 'mainView',
    state: {
      showWelcomeScreen: true
    },
    reducers: {
      showWelcomeScreen: showWelcomeScreen
    }
  }
}

function showWelcomeScreen (state, action) {
  return { showWelcomeScreen: false }
}
