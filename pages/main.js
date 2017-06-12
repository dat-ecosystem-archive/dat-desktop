'use strict'

const html = require('choo/html')
const shell = require('electron').shell

const Header = require('../elements/header')
const Sprite = require('../elements/sprite')
const Table = require('../elements/table')
const Intro = require('../elements/intro')
const Empty = require('../elements/empty')
const Inspect = require('../elements/inspect')
const Download = require('../elements/download')
const Login = require('../elements/login')
const Register = require('../elements/register')
const ResetPassword = require('../elements/reset-password')

module.exports = mainView

const header = Header()
const sprite = Sprite()
const download = Download()
const intro = Intro()
const inspect = Inspect()
const login = Login()
const register = Register()
const resetPassword = ResetPassword()

// render the main view
// (obj, obj, fn) -> html
function mainView (state, emit) {
  const showIntroScreen = state.intro.show
  const showInspectScreen = state.inspect.show
  const showDownloadScreen = state.download.show
  const dats = state.dats.values
  const isReady = state.dats.ready
  const headerProps = {
    isReady: isReady,
    session: state.user.session,
    oncreate: () => emit('dats:create'),
    onimport: (link) => emit('dats:download', link),
    onreport: () => shell.openExternal('https://github.com/datproject/dat-desktop/issues'),
    onhomepage: () => shell.openExternal('https://datproject.org/'),
    onprofile: () => shell.openExternal(`https://datproject.org/profile/${state.user.session.username}`),
    onlogin: () => emit('user:login'),
    onlogout: () => emit('user:logout')
  }

  document.title = 'Dat Desktop'

  if (showDownloadScreen) {
    return html`
      <div>
        ${sprite.render()}
        ${header.render(headerProps)}
        ${download.render(Object.assign({}, state.download, {
          oncancel: () => emit('download:hide'),
          ondownload: ({ key, location }) => {
            emit('dats:clone', { key, location })
            emit('download:hide')
          },
          onupdate: () => {
            emit('render')
          }
        }))}
      </div>
    `
  }

  if (showInspectScreen) {
    return html`
      <div>
        ${sprite.render()}
        ${header.render(headerProps)}
        ${inspect.render(Object.assign({}, state.inspect, {
          oncancel: () => emit('inspect:hide'),
          onupdate: () => emit('render')
        }))}
      </div>
    `
  }

  if (showIntroScreen) {
    document.title = 'Dat Desktop | Welcome'
    return html`
      <div>
        ${sprite.render()}
        ${intro.render({
          onexit: () => {
            emit('intro:hide')
          },
          onOpenHomepage: () => {
            emit('intro:open-homepage')
          },
          onupdate: () => {
            emit('render')
          }
        })}
      </div>
    `
  }

  if (state.user.show === 'login') {
    return html`
      <div>
        ${sprite.render()}
        ${header.render(headerProps)}
        ${login.render({
          onlogin: data => emit('user:login!', data),
          onregister: () => emit('user:register'),
          onresetpassword: () => emit('user:reset-password'),
          error: state.user.loginError
        })}
      </div>
    `
  }

  if (state.user.show === 'register') {
    return html`
      <div>
        ${sprite.render()}
        ${header.render(headerProps)}
        ${register.render({
          onregister: data => {
            emit('user:register!', data)
          },
          onlogin: () => {
            emit('user:login')
          },
          error: state.user.registerError
        })}
      </div>
    `
  }

  if (state.user.show === 'reset password') {
    return html`
      <div>
        ${sprite.render()}
        ${header.render(headerProps)}
        ${resetPassword.render({
          onreset: data => {
            emit('user:reset-password!', data)
          }
        })}
      </div>
    `
  }

  if (!dats.length) {
    return html`
      <div>
        ${sprite.render()}
        ${header.render(headerProps)}
        ${Empty()}
      </div>
    `
  }

  return html`
    <div>
      ${sprite.render()}
      ${header.render(headerProps)}
      ${Table(state, emit)}
    </div>
  `
}
