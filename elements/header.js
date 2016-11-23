'use strict'

const yo = require('choo/html')
const button = require('./button')
const encoding = require('dat-encoding')
const icon = require('./icon')

module.exports = (props) => {
  const keydown = (e) => {
    if (e.keyCode === 13) {
      const link = e.target.value
      try {
        encoding.decode(link)
      } catch (err) {
        throw new Error('Invalid link')
      }
      e.target.value = ''
      props.download(link)
    }
  }
  return yo`
    <header class="dat-header">
      ${button({
        icon: 'menu',
        text: '',
        cls: 'fr button-reset menu-trigger'
      })}
      <div class="fr">
        ${button({
          icon: 'create-new-dat',
          text: 'Create New Dat',
          cls: 'fr ml3 header-action',
          click: props.create
        })}
        <div class="dat-import">
          <svg class="dat-import--icon">
            <use xlink:href="#daticon-link" />
          </svg>
          <input type="text" placeholder="Import dat" onkeydown=${keydown} class="dat-import--input">
        </div>
      </div>
    </header>
  `
}
