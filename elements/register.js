var microcomponent = require('microcomponent')
var html = require('choo/html')
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
            <p>
              <input type="text" name="username" value=${username} />
            </p>
            <p>
              <input type="email" name="email" value=${email} />
            </p>
            <p>
              <input type="password" name="password" value=${password} />
            </p>
            <p>
              <input type="submit" value="Register" />
            </p>
            <p class="f7">
              <button class="pa0 bg-transparent color-blue hover-color-blue-hover" onclick=${onlogin}>Already have an Account? Log In »</button>
            </p>
          </form>
          ${error
            ? html`
                <div>Oops. ${error.message}</div>
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
