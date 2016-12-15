'use strict'

const html = require('choo/html')
const css = require('sheetify')
const button = require('./button')
const datImport = require('./dat-import')

const header = css `
  :host {
    height: 2.5rem;
    padding: .25rem .75rem;
    background-color: var(--color-neutral);
    color: var(--color-white);
    -webkit-app-region: drag;
  }

  :host .header-action {
    height: 1.75rem;
    display: inline-block;
    border: 1px solid var(--color-neutral-30);
    background: transparent;
    color: var(--color-neutral-30);
    text-align: center;
    vertical-align: middle;
  }
  :host .header-action svg {
    width: 1.1em;
  }
  :host .header-action:hover,
  :host .header-action:focus {
    outline: none;
    color: var(--color-white);
    border-color: var(--color-white);
  }
  :host .header-action .btn-text {
    font-size: .75rem;
  }
  :host .header-action-no-border {
    border-color: transparent;
  }
  :host .header-action-no-border:hover,
  :host .header-action-no-border:focus {
    border-color: transparent;
  }
  :host .menu-trigger {
    display: none !important;
    height: 2rem;
    color: var(--color-neutral--20);
  }
  :host .menu-trigger:hover,
  :host .menu-trigger:focus {
    color: var(--color-white);
  }
`

module.exports = (props) => {
  return html`
    <header class="${header}">
      <div class="fr">
        ${datImport()}
        ${button({
          icon: 'create-new-dat',
          text: 'Create New Dat',
          cls: 'ml2 b--transparent header-action header-action-no-border',
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
