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
      <div class="fr">
        <label for="test" class="dat-import">
          <input name="test" type="text" placeholder="Import dat" onkeydown=${keydown} class="dat-import-input">
          <svg>
            <use xlink:href="#daticon-link" />
          </svg>
        </label>
        ${button({
          icon: 'create-new-dat',
          text: 'Create New Dat',
          cls: 'ml2 header-action header-action-no-border',
          click: props.create
        })}
        ${button({
          text: 'Log In',
          cls: 'ml2 header-action'
        })}
        ${button({
          icon: 'menu',
          text: '',
          cls: 'ml2 header-action header-action-no-border menu-trigger'
        })}
      </div>
    </header>
  `
}
