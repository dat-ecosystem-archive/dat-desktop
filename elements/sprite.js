const datIcons = require('dat-icons/raw')

module.exports = svgSprite

function svgSprite () {
  const _el = document.createElement('div')
  _el.innerHTML = datIcons()
  return _el.childNodes[0]
}
