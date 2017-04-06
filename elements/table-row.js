var microcomponent = require('microcomponent')
var encoding = require('dat-encoding')
var bytes = require('prettier-bytes')
var nanomorph = require('nanomorph')
var nanotask = require('nanotask')
var html = require('choo/html')
var assert = require('assert')
var css = require('sheetify')

var button = require('./button')
var status = require('./status')
var icon = require('./icon')

var cellStyles = css`
  :host {
    .cell-1 {
      width: 4rem;
    }
    .cell-2 {
      width: 17rem;
    }
    .cell-3 {
      width: 15rem;
    }
    .cell-4 {
      width: 5.5rem;
      white-space: nowrap;
    }
    .cell-5 {
      width: 6rem;
    }
    .cell-6 {
      width: 10.25rem;
    }
    .cell-truncate {
      width: 26vw;
    }
  }
`

var iconStyles = css`
  :host {
    .row-action {
      height: 1.5rem;
      display: inline-block;
      color: var(--color-neutral-20);
      svg {
        vertical-align: middle;
        width: 1.1em;
        max-height: 1.6em;
      }
      &:hover,
      &:focus {
        outline: none;
        color: var(--color-neutral-50);
      }
      &:first-child {
        padding-left: 0;
      }
      &:last-child {
        padding-right: 0;
      }
    }
    .icon-network {
      display: inline-block;
      color: var(--color-neutral-20);
      vertical-align: sub;
      width: 1em;
      svg {
        border: 1px solid red;
      }
      svg polygon {
        fill: inherit;
      }
    }
  }
`

var networkStyles = css`
  :host {
    svg {
      height: 1.5rem;
      display: inline-block;
      color: var(--color-neutral-20);
      vertical-align: middle;
      width: 1.1em;
      max-height: 1.6em;
    }
    .network-peers-many {
      --polygon-1-color: var(--color-green);
      --polygon-2-color: var(--color-green);
      --polygon-3-color: var(--color-green);
    }
    .network-peers-1 {
      --polygon-1-color: var(--color-yellow);
      --polygon-2-color: var(--color-yellow);
    }
    .network-peers-0 {
      --polygon-1-color: var(--color-red);
    }
  }
`

module.exports = Row

function Row () {
  var hexContent = HexContent()
  var finderButton = FinderButton()
  var linkButton = LinkButton()
  var deleteButton = DeleteButton()
  var titleField = TitleField()
  var networkIcon = NetworkIcon()

  return function (dat, state, emit) {
    var stats = dat.stats && dat.stats.get()
    var peers = dat.network ? dat.network.connected : 'N/A'
    var key = encoding.encode(dat.key)

    stats.size = dat.archive.content
      ? bytes(dat.archive.content.bytes)
      : 'N/A'

    stats.state = !dat.network
      ? 'paused'
      : dat.owner || dat.progress === 1
        ? 'complete'
        : peers
          ? 'loading'
          : 'stale'

    return html`
      <tr id=${key} class=${cellStyles}>
        <td class="cell-1">
          <div class="w2 center">
            ${hexContent.render(dat, stats, emit)}
          </div>
        </td>
        <td class="cell-2">
          <div class="cell-truncate">
            ${titleField.render(dat, state, emit)}
            <p class="f7 color-neutral-60 truncate">
              <span class="author">${dat.metadata.author || 'Anonymous'} • </span>
              <span class="title">
                ${dat.owner ? 'Read & Write' : 'Read-only'}
              </span>
            </p>
          </div>
        </td>
        <td class="cell-3">
          ${status(dat, stats)}
        </td>
        <td class="tr cell-4 size">
          ${stats.size}
        </td>
        <td class="cell-5 ${networkStyles}">
          ${networkIcon.render(dat, emit)}
          <span class="network">${peers}</span>
        </td>
        <td class="cell-6">
          <div class="flex justify-end ${iconStyles}">
            ${finderButton.render(dat, emit)}
            ${linkButton.render(dat, emit)}
            ${deleteButton.render(dat, emit)}
          </div>
        </td>
      </tr>
    `
  }
}

function FinderButton () {
  var component = microcomponent('finder-button')
  component.on('render', render)
  component.on('update', update)
  return component

  function render (dat, emit) {
    return button.icon('Open in Finder', {
      icon: icon('open-in-finder'),
      class: 'row-action',
      onclick: function () {
        emit('dats:open', dat)
      }
    })
  }

  function update () {
    return false
  }
}

function LinkButton () {
  var component = microcomponent('link-button')
  component.on('render', render)
  component.on('update', update)
  return component

  function render (dat, emit) {
    return button.icon('Share Dat', {
      icon: icon('link'),
      class: 'row-action',
      onclick: function () {
        emit('dats:share', dat)
      }
    })
  }

  function update () {
    return false
  }
}

function DeleteButton () {
  var component = microcomponent('delete-button')
  component.on('render', render)
  component.on('update', update)
  return component

  function render (dat, emit) {
    return button.icon('Remove Dat', {
      icon: icon('delete'),
      class: 'row-action',
      onclick: function () {
        emit('dats:remove', { key: dat.key })
      }
    })
  }

  function update () {
    return false
  }
}

function NetworkIcon () {
  var peerCount = 0
  var component = microcomponent('network-icon')
  component.on('render', render)
  component.on('update', update)
  return component

  function render (dat, emit) {
    peerCount = dat.network ? dat.network.connected : 'N/A'
    var iconClass = peerCount === 0
      ? 'network-peers-0'
      : peerCount === 1
        ? 'network-peers-1'
        : 'network-peers-many'

    return icon('network', { class: iconClass })
  }

  function update (dat, emit) {
    var newPeerCount = dat.network ? dat.network.connected : 'N/A'
    return peerCount !== newPeerCount
  }
}

// create a new hexcontent icon
function HexContent () {
  var state = null
  var component = microcomponent('hex-content')
  component.on('render', render)
  component.on('update', update)
  component.on('unload', unload)
  return component

  function render (dat, stats, emit) {
    state = stats.state

    return {
      loading: button.icon('loading', {
        icon: icon('hexagon-down', {class: 'w2'}),
        class: 'color-blue hover-color-blue-hover',
        onclick: togglePause
      }),
      stale: button.icon('stale', {
        icon: icon('hexagon-x', {class: 'w2'}),
        class: 'color-neutral-30 hover-color-neutral-40',
        onclick: togglePause
      }),
      paused: button.icon('paused', {
        icon: icon('hexagon-resume', {class: 'w2'}),
        class: 'color-neutral-30 hover-color-neutral-40',
        onclick: togglePause
      }),
      complete: button.icon('complete', {
        icon: icon('hexagon-up', {class: 'w2'}),
        class: 'color-green hover-color-green-hover',
        onclick: togglePause
      })
    }[state]

    function togglePause () {
      emit('dats:toggle-pause', dat)
    }
  }

  function update (dat, stats, emit) {
    return stats.state !== state
  }

  function unload () {
    state = null
  }
}

// Editable title field
function TitleField () {
  var emit = null
  var state = {
    isEditing: false,
    editTarget: null,
    editValue: '',
    title: null,
    key: null
  }

  var task = nanotask()

  var component = microcomponent('table-row')
  component.on('render', render)
  component.on('render:active', renderActive)
  component.on('render:inactive', renderInactive)
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
    function onclick () {
      component.emit('render:active')
    }
  }

  function renderActive () {
    state.isEditing = true
    var self = this
    nanomorph(this._element, html`
      <section>
        <input class="f6 normal"
          value=${state.editValue} onkeyup=${handleKeyUp} />
        ${renderButton()}
      </section>
    `)

    this._element.querySelector('input').focus()

    function handleKeyUp (e) {
      var oldValue = state.editValue
      var newValue = e.target.value
      state.editValue = e.target.value

      if (e.code === 'Escape') {
        e.preventDefault()
        task(function () {
          component.emit('render:inactive')
        })
      } else if (e.code === 'Enter') {
        e.preventDefault()
        handleSave()
      } else {
        if (state.isEditing) {
          if ((!oldValue || !newValue) && oldValue !== newValue) {
            nanomorph(self._element.querySelector('button'), renderButton())
          }
        }
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

    function handleSave () {
      task(function () {
        var metadata = { title: state.editValue }
        emit('dats:update-metadata', { key: state.key, metadata: metadata })
        component.emit('render:inactive')
      })
    }
  }
}
