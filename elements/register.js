var microcomponent = require('microcomponent')
var html = require('choo/html')
var input = require('./input')
var button = require('./button')
var FormData = window.FormData

module.exports = function () {
  var component = microcomponent({
    name: 'register',
    state: {
      username: '',
      email: '',
      password: ''
    }
  })
  component.on('render', render)
  component.on('update', update)
  return component

  function render () {
    var { onregister, onlogin, error } = this.props
    var { username, email, password } = this.state

    function onsubmit (ev) {
      ev.preventDefault()
      var data = new FormData(ev.target)
      var username = data.get('username')
      var email = data.get('email')
      var password = data.get('password')
      onregister({ username, email, password })
      Object.assign(component.state, { username, email, password })
    }

    return html`
      <main class="flex items-center">
        <div class="mw5 mb5 center">
          <h1 class="f4 mb3">Create A New Account</h1>
          <form onsubmit=${onsubmit}>

            ${input(username, {
              type: 'text',
              name: 'username',
              placeholder: 'Username',
              icon: 'happy-dat'
            })}

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

            ${button.green('Register', {
              class: 'w-100 mb3'
            })}
            <p class="f7">
              <button class="pa0 bg-transparent color-blue hover-color-blue-hover" onclick=${onlogin}>Already have an Account? Log In »</button>
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
      </div>
    `
  }

  function update (props) {
    return props.error !== this.props.error
  }
}
