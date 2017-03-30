const explain = require('explain-error')
const fs = require('fs')

module.exports = dragDropModel

function dragDropModel (state, bus) {
  window.ondragover = function (e) {
    e.preventDefault()
  }
  window.ondrop = function (e) {
    e.preventDefault()
    var dirname = e.dataTransfer &&
      e.dataTransfer.files &&
      e.dataTransfer.files[0] &&
      e.dataTransfer.files[0].path
    if (!dirname) return
    fs.stat(dirname, (err, stat) => {
      if (err) return bus.emit('error', explain(err, 'models/window: fs.stat error on dirname'))
      if (!stat.isDirectory()) return
      bus.emit('dats:create', dirname)
    })
  }
}

