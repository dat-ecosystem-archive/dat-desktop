var microcomponent = require('microcomponent')
var nanomorph = require('nanomorph')
var html = require('choo/html')
var assert = require('assert')

module.exports = TitleField

function TitleField () {
  var emit = null
  var state = {
    isEditing: false,
    editTarget: null,
    editValue: '',
    title: null,
    key: null
  }

  var component = microcomponent('table-row')
  component.on('render', render)
  component.on('render:inactive', renderInactive)
  component.on('render:active', renderActive)
  component.on('update', update)
  component.on('unload', unload)
  return component

  function unload () {
    emit = null
    state = {
      isEditing: false,
      editTarget: null,
      editValue: null,
      title: null,
      key: null
    }
  }

  function update () {
    var res = true
    return res
  }

  function render (dat, newState, newEmit) {
    assert.ok(dat, 'TitleField: expected dat to exist')
    assert.ok(newState, 'TitleField: expected newState to exist')
    assert.ok(newEmit, 'TitleField: expected newEmit to exist')

    emit = newEmit || emit
    state.key = dat.key.toString('hex')
    state.title = dat.metadata.title || '#' + state.key

    if (!this._element) this._element = html`<section></section>`
    if (state.isEditing) component.emit('render:active')
    else component.emit('render:inactive')

    return this._element
  }

  function renderInactive () {
    state.isEditing = false
    state.editValue = ''
    nanomorph(this._element, html`
      <section>
        <h2 class="f6 normal truncate" onclick=${onclick}>
          ${state.title}
        </h2>
      </section>
    `)
    function onclick (e) {
      e.stopPropagation()
      e.preventDefault()
      component.emit('render:active')
    }
  }

  function renderActive () {
    state.isEditing = true
    var self = this
    nanomorph(this._element, html`
      <section>
        <input class="f6 normal"
          value=${state.editValue} onkeyup=${handleKeypress} />
        ${renderButton()}
      </section>
    `)

    self._element.querySelector('input').focus()

    function handleKeypress (e) {
      var oldValue = state.editValue
      var newValue = e.target.value
      state.editValue = newValue
      e.stopPropagation()

      if (e.code === 'Escape') {
        e.preventDefault()
        component.emit('render:inactive')
      } else if (e.code === 'Enter') {
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
          <button class="f6 white ttu bg-green" onclick=${handleSave}>
            save
          </button>
        `
      }
    }

    function handleSave (e) {
      e.stopPropagation()
      e.preventDefault()
      var metadata = { title: state.editValue }
      emit('dats:update-metadata', { key: state.key, metadata: metadata })
      component.emit('render:inactive')
    }
  }
}
