'use strict'

const microcomponent = require('microcomponent')
const html = require('choo/html')
const assert = require('assert')
const css = require('sheetify')

const button = require('./button')
const DatImport = require('./dat-import')
const icon = require('./icon')

module.exports = HeaderElement

const header = css`
  :host {
    height: 2.5rem;
    padding: .25rem .75rem;
    background-color: var(--color-neutral);
    color: var(--color-white);
    -webkit-app-region: drag;
  }
`

const shareButtonIcon = css`
  :host {
    width: 1.2em;
  }
`

const menuButtonIcon = css`
  :host {
    width: 1.75em;
    padding-top: .2rem;
  }
`

function HeaderElement () {
  var importButton = DatImport()
  var component = microcomponent({ name: 'header' })
  component.on('render', render)
  component.on('update', update)
  return component

  function render () {
    var { isReady, onimport, oncreate } = this.props

    assert.equal(typeof isReady, 'boolean', 'elements/header: isReady should be type boolean')
    assert.equal(typeof onimport, 'function', 'elements/header: onimport should be type function')
    assert.equal(typeof oncreate, 'function', 'elements/header: oncreate should be type function')

    if (!isReady) {
      return html`<header class="${header}"></header>`
    }

    var createButton = button.header('Share Folder', {
      id: 'create-new-dat',
      icon: icon('create-new-dat', { class: shareButtonIcon }),
      class: 'ml2 b--transparent v-mid color-neutral-30 hover-color-white',
      onclick: oncreate
    })

    var loginButton = button.header('Log In', {
      class: 'ml3 v-mid color-neutral-30 hover-color-white dn'
    })

    var menuButton = button.icon('Open Menu', {
      icon: icon('menu', { class: menuButtonIcon }),
      class: 'ml3 v-mid color-neutral-20 hover-color-white dn'
    })

    return html`
      <header class="${header}">
        <div class="fr">
          ${importButton.render({
            onsubmit: onimport
          })}
          ${createButton}
          ${loginButton}
          ${menuButton}
        </div>
      </header>
    `
  }

  function update (props) {
    return props.isReady !== this.props.isReady
  }
}
