// required for electron integration tests
if (process.env.RUNNING_IN_SPECTRON) {
  const dialog = require('electron').remote.dialog
  const path = require('path')

  dialog.showOpenDialog = (opts, cb) => {
    return [path.join(__dirname, '..', 'tests', 'fixtures')]
  }
}
