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
    return html`
      <div>
        <form>
          <input type="email" />
          <input type="password" />
          <button>Login</button>
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
