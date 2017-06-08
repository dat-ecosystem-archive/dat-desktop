var microcomponent = require('microcomponent')
var html = require('choo/html')

module.exports = function () {
  var component = microcomponent({
    name: 'login'
  })
  component.on('render', render)
  component.on('update', update)
  return component

  function render () {
    var { onlogin } = this.props

    function onsubmit (ev) {
      ev.preventDefault()
      var data = new FormData(ev.target)
      onlogin({
        email: data.get('email'),
        password: data.get('password')
      })
    }

    return html`
      <div>
        <form onsubmit=${onsubmit}>
          <input type="email" name="email">
          <input type="password" name="password">
          <input type="submit" value="Login">
          <button>Forgot password?</button>
          <button>Register</button>
        </form>
      </div>  
    `  
  }

  function update () {
    return false
  }
}
