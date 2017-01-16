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

    .header-action {
      height: 1.75rem;
      display: inline-block;
      border: 1px solid var(--color-neutral-30);
      background: transparent;
      color: var(--color-neutral-30);
      text-align: center;
      vertical-align: middle;
      svg {
        width: 1.1em;
      }
      &:hover,
      &:focus {
        outline: none;
        color: var(--color-white);
        border-color: var(--color-white);
      }
      .btn-text {
        font-size: .75rem;
      }
    }

    .header-action-no-border {
      border-color: transparent;
      &:hover,
      &:focus {
        border-color: transparent;
      }
    }

    .menu-trigger {
      height: 2rem;
      color: var(--color-neutral--20);
      &:hover,
      &:focus {
        color: var(--color-white);
      }
    }
    .log-in-button,
    .menu-trigger {
      display: none !important;
    }
  }
`

module.exports = (props) => {
  return html`
    <header class="${header}">
      <div class="fr">
        ${datImport(props)}
        ${button({
          icon: 'create-new-dat',
          text: 'Create New Dat',
          cls: 'ml2 b--transparent header-action header-action-no-border',
          click: props.create
        })}
        ${button({
          text: 'Log In',
          cls: 'ml2 header-action log-in-button'
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
