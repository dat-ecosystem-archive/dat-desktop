'use strict'

const html = require('choo/html')
const assert = require('assert')
const css = require('sheetify')

const button = require('./button')
const datImport = require('./dat-import')
const icon = require('dat-elements/icon')

module.exports = headerElement

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

function headerElement (props) {
  var isReady = props.isReady
  var onimport = props.onimport
  var oncreate = props.oncreate

  assert.equal(typeof isReady, 'boolean', 'elements/header: isReady should be type boolean')
  assert.equal(typeof onimport, 'function', 'elements/header: onimport should be type function')
  assert.equal(typeof oncreate, 'function', 'elements/header: oncreate should be type function')

  if (!isReady) {
    return html`<header class="${header}"></header>`
  }

  var importButton = datImport({ onsubmit: onimport })

  var createButton = button('Create New Dat', {
    id: 'create-new-dat',
    icon: icon('create-new-dat'),
    class: 'ml2 b--transparent header-action header-action-no-border',
    onclick: oncreate
  })

  var loginButton = button('Log In', { class: 'ml2 header-action log-in-button' })

  var menuButton = button.icon('Open Menu', {
    icon: icon('menu'),
    class: 'ml2 header-action header-action-no-border menu-trigger'
  })

  return html`
    <header class="${header}">
      <div class="fr">
        ${importButton}
        ${createButton}
        ${loginButton}
        ${menuButton}
      </div>
    </header>
  `
}
