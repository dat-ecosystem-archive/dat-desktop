const explain = require('explain-error')
const fs = require('fs')

module.exports = createModel

function createModel () {
  return {
    namespace: 'window',
    subscriptions: {
      'window-file-drop': dropFile
    }
  }
}

function dropFile (send, done) {
  window.ondragover = (e) => e.preventDefault()
  window.ondrop = (e) => {
    e.preventDefault()
    const dir = e.dataTransfer &&
      e.dataTransfer.files &&
      e.dataTransfer.files[0] &&
      e.dataTransfer.files[0].path
    if (!dir) return
    fs.stat(dir, (err, stat) => {
      if (err) return done(explain(err, 'models/window: fs.stat error on dir'))
      if (!stat.isDirectory()) return
      send('repos:add-dir', dir, done)
    })
  }
}
