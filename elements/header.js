'use strict'

const Nanocomponent = require('nanocomponent')
const html = require('choo/html')
const assert = require('assert')
const css = require('sheetify')
const version = require('../package.json').version

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
    z-index: 1000;
    position: relative;
    width: 100%;
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
  }
`

function HeaderElement () {
  if (!(this instanceof HeaderElement)) return new HeaderElement()
  Nanocomponent.call(this)
  this.props = null
  this.state = {}
}

HeaderElement.prototype = Object.create(Nanocomponent.prototype)

HeaderElement.prototype.createElement = function (props) {
  this.props = props
  var { isReady, onimport, oncreate, onreport, onupdate } = this.props
  var { showMenu } = this.state
  var importButton = DatImport()

  assert.equal(typeof isReady, 'boolean', 'elements/header: isReady should be type boolean')
  assert.equal(typeof onimport, 'function', 'elements/header: onimport should be type function')
  assert.equal(typeof oncreate, 'function', 'elements/header: oncreate should be type function')

  if (!isReady) {
    return html`<header class="${header}"></header>`
  }

  var createButton = button.header('Share Folder', {
    id: 'create-new-dat',
    icon: icon('create-new-dat', { class: shareButtonIcon }),
    class: 'ml2 ml3-l b--transparent v-mid color-neutral-30 hover-color-white f7 f6-l',
    onclick: oncreate
  })

  var loginButton = button.header('Log In', {
    class: 'ml3 v-mid color-neutral-30 hover-color-white f7 f6-l dn'
  })

  var menuButton = button.icon('Open Menu', {
    icon: icon('menu', { class: menuButtonIcon }),
    class: 'ml3 v-mid color-neutral-20 hover-color-white pointer',
    onclick: function () {
      toggle(true)
      return false
    }
  })

  var self = this
  function toggle (newState) {
    if (self.state.showMenu !== newState) {
      self.state.showMenu = newState
      setTimeout(function () {
        if (newState) {
          document.body.addEventListener('click', clickedOutside)
        } else {
          document.body.removeEventListener('click', clickedOutside)
        }
      }, 1)
      self.state.update = true
      onupdate()
    }
  }

  function clickedOutside (e) {
    if (!self.element.contains(e.target)) toggle(false)
  }

  return html`
      <header class="${header}">
        <div class="fr relative">
          ${importButton.render({
            onsubmit: onimport
          })}
          ${createButton}
          ${loginButton}
          ${menuButton}
          ${showMenu
            ? html`
            <div class="absolute right-0 w5 pa3 bg-neutral">
              <h3 class="f6 f5-l mb2">
                Dat Desktop ${version}
              </h3>
              <p class="f6 f5-l mb3">
                Dat Desktop is a peer to peer sharing app built for humans by humans.
              </p>
              <p class="f6 f5-l">
                <a onclick=${onreport} href="#" class="color-neutral-50  hover-color-neutral-70">Report Bug</a>
              </p>
            </div>
              `
            : ''}
        </div>
      </header>
    `
}

HeaderElement.prototype.update = function (props) {
  if (this.state.update) {
    this.state.update = false
    return true
  }
  return props.isReady !== this.props.isReady
}
