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

  .header-action {
    height: 1.75rem;
    display: inline-block;
    border: 1px solid var(--color-neutral-30);
    background: transparent;
    color: var(--color-neutral-30);
    text-align: center;
    vertical-align: middle;
  }
  .header-action svg {
    width: 1.1em;
  }
  .header-action:hover,
  .header-action:focus {
    outline: none;
    color: var(--color-white);
    border-color: var(--color-white);
  }
  .header-action .btn-text {
    font-size: .75rem;
  }
  .header-action-no-border {
    border-color: transparent;
  }
  .header-action-no-border:hover,
  .header-action-no-border:focus {
      border-color: transparent;
    }
  .menu-trigger {
//    display: none !important;

    height: 2rem;
    color: var(--color-neutral--20);
  }
  .menu-trigger:hover,
  .menu-trigger:focus {
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
