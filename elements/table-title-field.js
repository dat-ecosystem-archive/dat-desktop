var Nanocomponent = require('nanocomponent')
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
  if (!(this instanceof TitleField)) return new TitleField()
  Nanocomponent.call(this)
  this.props = null
  this.state = resetState()

  function resetState () {
    return {
      isEditing: false,
      editTarget: null,
      editValue: '',
      title: null,
      key: null
    }
  }
}

TitleField.prototype = Object.create(Nanocomponent.prototype)

TitleField.prototype.createElement = function (props) {
  var dat = props.dat
  this.props = props
  var state = this.state

  if (dat) {
    state.writable = dat.writable
    state.key = dat.key.toString('hex')
    state.title = dat.metadata.title || ''
    state.placeholderTitle = '#' + state.key
  }

  return (state.isEditing && state.writable)
    ? this.renderActive()
    : this.renderInactive()
}

TitleField.prototype.renderInactive = function () {
  var self = this
  var state = this.state
  state.editValue = ''

  return state.writable
    ? html`
          <div class=${editableField}>
            <h2 class="f6 f5-l normal truncate pr3" onclick=${onclick}>
              ${state.title || state.placeholderTitle}
              ${icon('edit', { class: 'absolute top-0 bottom-0 right-0 color-neutral-30 indicator' })}
            </h2>
          </div>
        `
    : html`
          <div>
            <h2 class="f6 f5-l normal truncate pr3">
              ${state.title || state.placeholderTitle}
            </h2>
          </div>
        `

  function onclick (e) {
    e.stopPropagation()
    e.preventDefault()
    state.isEditing = true
    state.editValue = state.title
    state.update = true
    self.props.emit('render')
  }
}

TitleField.prototype.renderActive = function () {
  var self = this
  setTimeout(function () {
    var input = self.element.querySelector('input')
    input.focus()
    input.select()
  }, 0)

  var state = this.state
  return html`
      <div>
        <div class=${overlay} onclick=${deactivate}></div>
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
      nanomorph(self.element.querySelector('button'), renderButton())
    }
  }

  function renderButton () {
    if (state.editValue === state.title) {
      return button('Save', { onclick: deactivate })
    } else {
      return button.green('Save', { onclick: handleSave })
    }
  }

  function handleSave (e) {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    self.props.emit('dats:update-title', { key: self.state.key, title: self.state.editValue })
    deactivate()
  }

  function deactivate (e) {
    if (e) e.stopPropagation()
    state.isEditing = false
    state.update = true
    self.props.emit('render')
  }
}

TitleField.prototype.update = function ({ dat }, external) {
  if (this.state.update) {
    if (!external) {
      // `.update` is usually called (and part of) the `.render` method
      // meaning that setting "state.update" once will result in exactly
      // one rendering. However, since the table-row is a complex component
      // and the table row uses `.update` to see if any of the child
      // components would need an update. If the call comes from
      // the parent (or externally) we do not reset the update property
      // to make sure that `.state.update` stays true until actually
      // rendering the component
      this.state.update = false
    }
    return true
  }

  if (dat.writable !== this.state.writable) {
    return true
  }

  if (dat.key.toString('hex') !== this.state.key) {
    return true
  }

  var oldTitle = (dat.metadata.title || '#' + this.state.key)

  if (this.state.title !== oldTitle) {
    return true
  }

  return false
}
