var xtend = Object.assign

module.exports = downloadModel

function downloadModel (state, bus) {
  state.download = xtend({
    show: false
  }, state.download)

  bus.on('dats:download', function (link) {
    state.download.show = true
    state.download.link = link
    bus.emit('render')
  })

  bus.on('download:cancel', function (link) {
    state.download.show = false
    state.download.link = null
    bus.emit('render')
  })
}
