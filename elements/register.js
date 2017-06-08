var microcomponent = require('microcomponent')
var html = require('choo/html')

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
      <div>
        <form onsubmit=${onsubmit}>
          <input type="text" name="username" value=${username} />
          <input type="email" name="email" value=${email} />
          <input type="password" name="password" value=${password} />
          <input type="submit" value="Register" />
          <button onclick=${onlogin}>Login instead</button>
        </form>
        ${error
          ? html`
              <div>Error! ${error.message}</div>
            `
          : ''}
      </div>  
    `  
  }

  function update (props) {
    return props.error !== this.props.error
  }
}
