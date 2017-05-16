var microcomponent = require('microcomponent')
var nanomorph = require('nanomorph')
var html = require('choo/html')
var css = require('sheetify')
var icon = require('./icon')
var button = require('./button')

var overlay = css`
  :host {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0,0,0,.2);
  }
`

var editableField = css`
  :host {
    position: relative;
    h2 {
      position: relative;
    }
    .indicator {
      position: absolute;
      display: none;
      top: .25rem;
      right: 0;
      width: .75rem;
    }
    &:hover, &:focus {
      h2 {
        color: var(--color-blue);
      }
      .indicator {
        display: block;
      }
    }
  }
`

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
      state.title = dat.metadata.title || ''
      state.placeholderTitle = '#' + state.key
    }

    if (state.isEditing && state.writable) return component.emit('render:active')
    else return component.emit('render:inactive')
  }

  function renderInactive () {
    state.editValue = ''

    return state.writable
      ? html`
          <div class=${editableField}>
            <h2 class="f6 normal truncate pr3" onclick=${onclick}>
              ${state.title || state.placeholderTitle}
              ${icon('edit', { class: 'absolute top-0 bottom-0 right-0 color-neutral-30 indicator' })}
            </h2>
          </div>
        `
      : html`
          <div>
            <h2 class="f6 normal truncate pr3">
              ${state.placeholderTitle}
            </h2>
          </div>
        `

    function onclick (e) {
      e.stopPropagation()
      e.preventDefault()
      state.isEditing = true
      state.editValue = state.title
      component.emit('render')
    }
  }

  function renderActive () {
    setTimeout(function () {
      var input = self._element.querySelector('input')
      input.focus()
      input.select()
    }, 0)

    var self = this
    return html`
      <div>
        <div class="${overlay}"></div>
        <div class="${editableField} bg-white nt1 nb1 nl1 pl1 shadow-1 flex justify-between">
          <input class="bn f6 normal w-100"
            value=${state.editValue} onkeyup=${handleKeypress} />
          ${renderButton()}
        </div>
      </div>
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
        e.preventDefault()
        handleSave()
      } else if (oldValue !== newValue) {
        nanomorph(self._element.querySelector('button'), renderButton())
      }
    }

    function renderButton () {
      if (state.editValue === state.title) {
        return html`
          ${button('Save', { onload: attachListener })}
        `
      } else {
        return html`
          ${button.green('Save', { onclick: handleSave, onload: attachListener })}
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
      if (source.className === overlay) deactivate()
    }
  }
}
