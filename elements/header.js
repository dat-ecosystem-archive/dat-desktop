'use strict'

const version = require('../package.json').version
const microcomponent = require('microcomponent')
const gravatar = require('gravatar')
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
    width: 1em;
  }
`

const avatarButtonStyles = css`
  :host {
    border: 2px solid var(--color-neutral-40);
    vertical-align: middle;
    background-color: var(--color-pink);
    &:hover, &:focus {
      border-color: var(--color-white);
    }
  }
`

const menuStyles = css`
  :host {
    width: 14rem;
    padding-left: 1rem;
    padding-right: 1rem;
    position: absolute;
    z-index: 2;
    top: 3rem;
    right: 0;
    border: 1px solid var(--color-neutral-20);
    border-radius: .25rem;
    background-color: var(--color-white);
    color: var(--color-neutral-60);
    box-shadow: 0 0 4px 2px rgba( 0, 0, 0, .1);
    section {
      padding-top: 1rem;
      padding-bottom: 1rem;
      &:first-child {
        border-bottom: 1px solid var(--color-neutral-20);
      }
    }
    a {
      text-decoration: none;
      color: var(--color-neutral-80);
      &:hover, &:focus {
        color: var(--color-blue-hover);
      }
    }
  }
`

function HeaderElement () {
  var importButton = DatImport()
  var component = microcomponent({ name: 'header' })
  component.on('render', render)
  component.on('update', update)
  return component

  function render () {
    var { isReady, session, onimport, oncreate, onreport, onlogin, onlogout, onprofile, onhomepage } = this.props
    var { showMenu, willShowMenu } = this.state

    if (typeof willShowMenu === 'boolean') {
      showMenu = this.state.showMenu = willShowMenu
      this.state.willShowMenu = null
    }

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

    var loginButton = button.green('Log In', {
      class: 'ml3 v-mid color-neutral-30 hover-color-white f7 f6-l',
      onclick: onlogin
    })

    var menuButton = button.icon('Open Menu', {
      icon: icon('info', { class: menuButtonIcon }),
      class: 'ml3 v-mid color-neutral-20 hover-color-white pointer',
      onclick: toggle
    })

    var avatar = {
      size: 26
    }
    if (session) {
      avatar.url = gravatar.url(session.email, {
        s: avatar.size * 2,
        r: 'pg',
        d: '404',
        protocol: 'https'
      })
    }

    var avatarButton = html`
      <img  onclick=${toggle}
            src=${avatar.url}
            width=${avatar.size}
            height=${avatar.size}
            class="${avatarButtonStyles} ml4" />
    `

    function toggle () {
      if (component.state.showMenu) hide()
      else show()
    }

    function show () {
      document.body.addEventListener('click', clickedOutside)
      component.state.willShowMenu = true
      component.render(component.props)
    }

    function hide () {
      document.body.removeEventListener('click', clickedOutside)
      component.state.willShowMenu = false
      component.render(component.props)
    }

    function clickedOutside (e) {
      if (!component._element.contains(e.target)) hide()
    }

    function onclicklogout () {
      component.state.willShowMenu = false
      onlogout()
    }

    return html`
      <header class="${header}">
        <div class="fr relative">
          ${importButton.render({
            onsubmit: onimport
          })}
          ${createButton}
          ${session
            ? html`
                ${avatarButton}
              `
            : html`
                <span>
                  ${menuButton}
                  ${loginButton}
                </span>
              `}
          ${showMenu
            ? html`
            <div class="${menuStyles}">
              ${session
                ? html`
                    <section class="f7">
                      ${session.email}
                    </section>
                  `
                : html`
                    <section class="f7">
                      Dat Desktop is a peer to peer sharing app built for humans by humans.
                    </section>
                  `}
              <section>
                ${session
                  ? html`
                      <a onclick=${onprofile} href="#" class="db ttu mb2">Profile</a>
                    `
                  : ''}
                    <a onclick=${onreport} href="#" class="db ttu mb2">Report Bug</a>
                ${session
                  ? html`
                      <a onclick=${onclicklogout} href="#" class="db ttu mb2">Log out</a>
                    `
                  : ''}
              </section>
              <section class="f7">
                Version ${version} | Built by
                <a onclick=${onhomepage} href="#">datproject.org</a>
              </section>
            </div>
              `
            : ''}
        </div>
      </header>
    `
  }

  function update (props) {
    return props.isReady !== this.props.isReady ||
      typeof this.state.willShowMenu === 'boolean' ||
      props.session !== this.props.session
  }
}
