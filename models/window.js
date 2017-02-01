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
    const dirname = e.dataTransfer &&
      e.dataTransfer.files &&
      e.dataTransfer.files[0] &&
      e.dataTransfer.files[0].path
    if (!dirname) return
    fs.stat(dirname, (err, stat) => {
      if (err) return done(explain(err, 'models/window: fs.stat error on dirname'))
      if (!stat.isDirectory()) return
      send('repos:create', dirname, done)
    })
  }
}
