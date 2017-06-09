var microcomponent = require('microcomponent')
var html = require('choo/html')
var input = require('./input')
var button = require('./button')
var FormData = window.FormData

module.exports = function () {
  var component = microcomponent({
    name: 'login',
    state: {
      email: '',
      password: ''
    }
  })
  component.on('render', render)
  component.on('update', update)
  return component

  function render () {
    var { onlogin, onregister, error } = this.props
    var { email, password } = this.state

    function onsubmit (ev) {
      ev.preventDefault()
      var data = new FormData(ev.target)
      var email = data.get('email')
      var password = data.get('password')
      onlogin({ email, password })
      Object.assign(component.state, { email, password })
    }

    return html`
      <main class="flex items-center">
        <div class="mw5 mb5 center">
          <h1 class="f4 mb3">Log In</h1>
          <form onsubmit=${onsubmit}>

            ${input(email, {
              type: 'email',
              name: 'email',
              placeholder: 'E-Mail',
              icon: 'letter'
            })}

            ${input(password, {
              type: 'password',
              name: 'password',
              placeholder: 'Password',
              icon: 'lock'
            })}

            ${button.green('Log In', {
              class: 'w-100 mb3'
            })}

            <p class="f7">
              <button class="mr3 pa0 bg-transparent color-blue hover-color-blue-hover">Forgot Password?</button>
              <button class="pa0 bg-transparent color-blue hover-color-blue-hover" onclick=${onregister}>No Account yet? Register »</button>
            </p>
          </form>
          ${error
            ? html`
              <p class="mt3 f7 color-red">
                Oops. ${error.message}
              </p>
              `
            : ''}
        </div>
      </main>
    `
  }

  function update (props) {
    return props.error !== this.props.error
  }
}
