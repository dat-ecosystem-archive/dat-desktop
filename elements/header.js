'use strict'

const yo = require('choo/html')
const button = require('./button')
const datImport = require('./dat-import')

module.exports = (props) => {
  return yo`
    <header class="dat-header">
      <div class="fr">
        ${datImport()}
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
