const Model = require('choo-model')

module.exports = createModel

function createModel (cb) {
  const model = Model('mainView')

  model.state({ showWelcomeScreen: true })
  model.reducer('closeWelcomeScreen', (state, action) => {
    return { showWelcomeScreen: false }
  })

  return model.start()
}
