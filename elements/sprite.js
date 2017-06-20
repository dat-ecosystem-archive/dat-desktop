const Component = require('rooch/component')
const datIcons = require('dat-icons/raw')
const h = require('rooch/h')

module.exports = class SvgSprite extends Component {
  render () {
    return h('div', {
      dangerouslySetInnerHTML: { __html: datIcons() }
    })
  }
  shouldComponentUpdate () {
    return false
  }
}
