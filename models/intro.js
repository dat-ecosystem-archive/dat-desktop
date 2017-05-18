var shell = require('electron').shell
var xtend = Object.assign

module.exports = introModel

function introModel (state, bus) {
  state.intro = xtend({
    show: false
  }, state.intro)

  // FIXME: wait for DOMContentLoaded
  // requires some sort of global load event first
  bus.on('dats:loaded', function () {
    if (state.dats.values.length) return
    state.intro.show = true
    bus.emit('render')
  })

  bus.on('intro:hide', function () {
    state.intro.show = false
    bus.emit('render')
  })

  bus.on('intro:open-homepage', function () {
    shell.openExternal('https://datproject.org/')
  })
}
