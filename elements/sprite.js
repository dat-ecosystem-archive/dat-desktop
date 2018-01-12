var html = require('choo/html')
const Nanocomponent = require('nanocomponent')
const datIcons = require('dat-icons/raw')

module.exports = SvgSprite

function SvgSprite () {
  if (!(this instanceof SvgSprite)) return new SvgSprite()
  Nanocomponent.call(this)
}

SvgSprite.prototype = Object.create(Nanocomponent.prototype)

SvgSprite.prototype.createElement = function () {
  const _el = document.createElement('div')
  _el.innerHTML = datIcons()
  return html`
  <div>
    ${_el.childNodes[0]}
  </div>
  `
}

SvgSprite.prototype.update = function () {
  return false
}

