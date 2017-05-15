var xtend = Object.assign

module.exports = downloadModel

function downloadModel (state, bus) {
  state.download = xtend({
    show: false
  }, state.download)

  bus.on('dats:download', function () {
    state.download.show = true
    bus.emit('render')
  })
}
