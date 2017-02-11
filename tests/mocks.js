var path = require('path')

module.exports = function (dialog) {
  dialog.showOpenDialog = (opts, cb) => {
    return [path.join(__dirname, 'fixtures')]
  }
}
