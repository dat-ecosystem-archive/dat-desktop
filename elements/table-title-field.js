var microcomponent = require('microcomponent')
var nanomorph = require('nanomorph')
var html = require('choo/html')

module.exports = TitleField

// Creates an input field with an explicit save button.
// There's 2 modes: active and inactive.
// Only dats that you can write to can have an active input field.
// Inactive becomes active by clicking on the input field.
// Active becomes inactive by:
// - clicking anywhere outside the field
// - pressing escape
// - pressing enter (saving)
// - clicking the save button (saving)
function TitleField () {
  var state = resetState()
  var emit = null

  var component = microcomponent('table-row')
  component.on('render', render)
  component.on('render:active', renderActive)
  component.on('render:inactive', renderInactive)
  component.on('update', update)
  component.on('unload', unload)
  return component

  function unload () {
    emit = null
    state = resetState()
  }

  function update (dat, newState, newEmit) {
    return dat.writable !== state.writable ||
      dat.key.toString('hex') !== state.key ||
      state.title !== dat.metadata.title || '#' + state.key
  }

  function resetState () {
    return {
      isEditing: false,
      editTarget: null,
      editValue: '',
      title: null,
      key: null
    }
  }

  function render (dat, newState, newEmit) {
    if (newEmit) emit = newEmit
    if (dat) {
      state.writable = dat.writable
      state.key = dat.key.toString('hex')
      state.title = dat.metadata.title || '#' + state.key
    }

    if (state.isEditing && state.writable) return component.emit('render:active')
    else return component.emit('render:inactive')
  }

  function renderInactive () {
    state.editValue = ''

    return html`
      <section>
        <h2 class="f6 normal truncate" onclick=${onclick}>
          ${state.title}
        </h2>
      </section>
    `

    function onclick (e) {
      e.stopPropagation()
      e.preventDefault()
      state.isEditing = true
      component.emit('render')
    }
  }

  function renderActive () {
    if (!state.isEditing) {
      state.isEditing = true
      attachListener()
    }

    setTimeout(function () {
      self._element.querySelector('input').focus()
    }, 0)

    var self = this
    return html`
      <section>
        <input class="f6 normal"
          value=${state.editValue} onkeyup=${handleKeypress} />
        ${renderButton()}
      </section>
    `

    function handleKeypress (e) {
      var oldValue = state.editValue
      var newValue = e.target.value
      state.editValue = newValue
      e.stopPropagation()

      if (e.code === 'Escape') {
        e.preventDefault()
        deactivate()
      } else if (e.code === 'Enter') {
        if (!newValue) return
        e.preventDefault()
        handleSave()
      } else if ((!oldValue || !newValue) && oldValue !== newValue) {
        nanomorph(self._element.querySelector('button'), renderButton())
      }
    }

    function renderButton () {
      if (state.editValue === '') {
        return html`
          <button class="f6 white ttu bg-light-gray">
            save
          </button>
        `
      } else {
        return html`
          <button class="f6 white ttu bg-color-green" onclick=${handleSave}>
            save
          </button>
        `
      }
    }

    function handleSave (e) {
      if (e) {
        e.stopPropagation()
        e.preventDefault()
      }
      emit('dats:update-title', { key: state.key, title: state.editValue })
      deactivate()
    }

    function deactivate () {
      document.body.removeEventListener('click', clickedOutside)
      state.isEditing = false
      component.emit('render')
    }

    function attachListener () {
      document.body.addEventListener('click', clickedOutside)
    }

    function clickedOutside (e) {
      var source = e.target
      while (source.parentNode) {
        if (source === self._element) return
        source = source.parentNode
      }
      deactivate()
    }
  }
}
