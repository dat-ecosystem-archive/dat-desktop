var microcomponent = require('microcomponent')
var html = require('choo/html')

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
    var { onlogin, error } = this.props
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
      <div>
        <form onsubmit=${onsubmit}>
          <input type="email" name="email" value=${email} />
          <input type="password" name="password" value=${password} />
          <input type="submit" value="Login" />
          <button>Forgot password?</button>
          <button>Register</button>
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
