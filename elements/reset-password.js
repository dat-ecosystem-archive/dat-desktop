var microcomponent = require('microcomponent')
var html = require('choo/html')
var FormData = window.FormData

module.exports = function () {
  var component = microcomponent({
    name: 'reset-password',
    state: {
      email: '',
    }
  })
  component.on('render', render)
  component.on('update', update)
  return component

  function render () {
    var { onreset, error } = this.props
    var { email } = this.state

    function onsubmit (ev) {
      ev.preventDefault()
      var data = new FormData(ev.target)
      var email = data.get('email')
      onreset({ email })
      Object.assign(component.state, { email })
    }

    return html`
      <div>
        <form onsubmit=${onsubmit}>
          <input type="email" name="email" value=${email} />
          <input type="submit" value="Reset" />
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
