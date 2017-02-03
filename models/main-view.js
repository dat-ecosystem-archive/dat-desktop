module.exports = createModel

function createModel (cb) {
  return {
    namespace: 'mainView',
    state: {
      showWelcomeScreen: true
    },
    reducers: {
      closeWelcomeScreen: closeWelcomeScreen
    }
  }
}

function closeWelcomeScreen (state, action) {
  return { showWelcomeScreen: false }
}
