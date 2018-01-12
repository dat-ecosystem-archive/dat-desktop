var Nanocomponent = require('nanocomponent')
var encoding = require('dat-encoding')
var html = require('choo/html')
var css = require('sheetify')

var TitleField = require('./table-title-field')
var button = require('./button')
var status = require('./status')
var icon = require('./icon')
var { datSize, datPeers, datState } = require('../lib/datInfo')

var cellStyles = css`
  :host {
    transition: background-color .025s ease-out;
    &:hover, &:focus {
      background-color: var(--color-neutral-04);
      cursor: pointer;
    }
    .cell-1 {
      width: 4rem;
    }
    .cell-2 {
      width: 14rem;
      max-width: 12rem;
      @media (min-width: 768px) {
        max-width: 20rem;
      }
      @media (min-width: 1280px) {
        max-width: 24rem;
      }
    }
    .cell-3 {
      width: 15rem;
    }
    .cell-4 {
      width: 4.5rem;
      white-space: nowrap;
    }
    .cell-5 {
      width: 4.5rem;
      white-space: nowrap;
    }
    .cell-6 {
      width: 10.25rem;
    }
    .cell-truncate {
      width: 100%;
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
        @media (min-width: 960px) {
          width: 1.4em;
        }
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
      svg polygon {
        fill: inherit;
      }
    }
  }
`

var networkStyles = css`
  :host {
    vertical-align: top;
    svg {
      height: 1.5rem;
      display: inline-block;
      color: var(--color-neutral-20);
      vertical-align: top;
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
  if (!(this instanceof Row)) return new Row()
  Nanocomponent.call(this)

  this.parts = {
    hexContent: HexContent(),
    finderButton: FinderButton(),
    linkButton: LinkButton(),
    deleteButton: DeleteButton(),
    titleField: TitleField(),
    networkIcon: NetworkIcon()
  }
}

Row.prototype = Object.create(Nanocomponent.prototype)

Row.prototype.createElement = function (props) {
  var { dat, emit, highlight } = props
  var parts = this.parts
  if (dat instanceof Error) return errorRow(dat, emit, parts.deleteButton)

  var key = encoding.encode(dat.key)
  var styles = cellStyles
  if (highlight) styles += ' fade-highlight'

  function onclick () {
    if (!parts.titleField.state.isEditing) {
      emit('dats:inspect', dat)
    }
  }

  return html`
      <tr id=${key} class=${styles} onclick=${onclick}>
        <td class="cell-1">
          <div class="w2 center">
            ${parts.hexContent.render(props)}
          </div>
        </td>
        <td class="cell-2">
          <div class="cell-truncate">
            ${parts.titleField.render(props)}
            <p class="f7 f6-l color-neutral-60 truncate">
              <span class="author">${dat.metadata.author || 'Anonymous'} • </span>
              <span class="title">
                ${dat.writable ? 'Read & Write' : 'Read-only'}
              </span>
            </p>
          </div>
        </td>
        <td class="cell-3">
          ${status(dat)}
        </td>
        <td class="f6 f5-l cell-4 size">
          ${datSize(dat)}
        </td>
        <td class="cell-5 ${networkStyles}">
          ${parts.networkIcon.render(props)}
          <span class="network v-top f6 f5-l ml1">${datPeers(dat)}</span>
        </td>
        <td class="cell-6">
          <div class="flex justify-end ${iconStyles}">
            ${parts.finderButton.render(props)}
            ${parts.linkButton.render(props)}
            ${parts.deleteButton.render(props)}
          </div>
        </td>
      </tr>
    `
}

Row.prototype.update = function (props) {
  return Object.values(this.parts).find(component => component.update(props, true)) !== undefined
}

function FinderButton () {
  if (!(this instanceof FinderButton)) return new FinderButton()
  Nanocomponent.call(this)
}

FinderButton.prototype = Object.create(Nanocomponent.prototype)

FinderButton.prototype.createElement = function (props) {
  var { dat, emit } = props
  return button.icon('Open in Finder', {
    icon: icon('open-in-finder'),
    class: 'row-action',
    onclick: function (e) {
      e.preventDefault()
      e.stopPropagation()
      emit('dats:open', dat)
    }
  })
}

FinderButton.prototype.update = function () {
  return false
}

function LinkButton () {
  if (!(this instanceof LinkButton)) return new LinkButton()
  Nanocomponent.call(this)
}

LinkButton.prototype = Object.create(Nanocomponent.prototype)

LinkButton.prototype.createElement = function (props) {
  var { dat, emit } = props
  return button.icon('Share Dat', {
    icon: icon('link'),
    class: 'row-action',
    onclick: function (e) {
      e.preventDefault()
      e.stopPropagation()
      emit('dats:share', dat)
    }
  })
}

LinkButton.prototype.update = function () {
  return false
}

function DeleteButton () {
  if (!(this instanceof DeleteButton)) return new DeleteButton()
  Nanocomponent.call(this)
}

DeleteButton.prototype = Object.create(Nanocomponent.prototype)

DeleteButton.prototype.createElement = function (props) {
  var { dat, emit } = props
  return button.icon('Remove Dat', {
    icon: icon('delete'),
    class: 'row-action delete',
    onclick: function (e) {
      e.preventDefault()
      e.stopPropagation()
      emit('dats:remove', { key: dat.key || dat.data.key })
    }
  })
}

DeleteButton.prototype.update = function () {
  return false
}

function NetworkIcon () {
  if (!(this instanceof NetworkIcon)) return new NetworkIcon()
  Nanocomponent.call(this)
  this.state = {
    peerCount: 0
  }
}

NetworkIcon.prototype = Object.create(Nanocomponent.prototype)

NetworkIcon.prototype.createElement = function (props) {
  var { dat } = props
  var peerCount = this.state.peerCount = dat.network
    ? dat.network.connected
    : 0
  var iconClass = peerCount === 0
    ? 'network-peers-0'
    : peerCount === 1
    ? 'network-peers-1'
    : 'network-peers-many'

  return html`
    <div>${icon('network', { class: iconClass })}</div>
  `
}

NetworkIcon.prototype.update = function ({ dat, emit }) {
  var newPeerCount = dat.network ? dat.network.connected : 0
  return this.state.peerCount !== newPeerCount
}

// create a new hexcontent icon
function HexContent () {
  if (!(this instanceof HexContent)) return new HexContent()
  Nanocomponent.call(this)
  this.state = {
    peerCount: 0
  }
}

HexContent.prototype = Object.create(Nanocomponent.prototype)

HexContent.prototype.createElement = function (props) {
  var state = this.state.state = datState(props.dat)
  var { emit, dat } = props

  var self = this
  function onmousemove (ev) {
    if (!self.element.contains(ev.target)) {
      self.state.hover = false
      self.state.update = true
      self.state.listening = false
      document.body.removeEventListener('mousemove', onmousemove)
      emit('render')
    }
  }

  if (this.state.hover && !this.state.listening) {
    document.body.addEventListener('mousemove', onmousemove)
    this.state.listening = true
  }

  if (this.state.hover) {
    return button.icon('pause', {
      icon: icon('hexagon-pause', {class: 'w2'}),
      class: 'color-neutral-40 ph0',
      onclick: togglePause
    })
  } else if (state === 'loading') {
    return button.icon('loading', {
      icon: icon('hexagon-down', {class: 'w2'}),
      class: 'color-blue hover-color-blue-hover ph0',
      onclick: togglePause
    })
  } else if (state === 'paused') {
    return button.icon('paused', {
      icon: icon('hexagon-resume', {class: 'w2'}),
      class: 'color-neutral-30 hover-color-neutral-40 ph0',
      onclick: togglePause
    })
  } else if (state === 'complete') {
    return button.icon('complete', {
      icon: icon('hexagon-up', {class: 'w2'}),
      class: 'color-green hover-color-green-hover ph0',
      onclick: togglePause,
      onmouseover: ev => {
        this.state.hover = true
        this.state.update = true
        emit('render')
      }
    })
  } else {
    return button.icon('stale', {
      icon: icon('hexagon-x', {class: 'w2'}),
      class: 'color-neutral-30 hover-color-neutral-40 ph0',
      onclick: togglePause
    })
  }

  function togglePause (e) {
    e.preventDefault()
    e.stopPropagation()
    emit('dats:toggle-pause', dat)
  }
}

HexContent.prototype.update = function ({ dat, emit }, external) {
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
  return datState(dat) !== this.state.state
}

function errorRow (err, emit, deleteButton) {
  var errorHexIcon = icon('hexagon-x', {
    class: 'w2 color-red'
  })
  return html`
    <tr class="bg-yellow-disabled">
      <td class="cell-1">
        <div class="w2 center">
          ${errorHexIcon}
        </div>
      </td>
      <td class="cell-2" colspan="4">
        <div class="cell-truncate color-red">
          <h2 class="f6 f5-l normal">
            Error
          </h2>
          <p class="f7 f6-l">
            Could not share ${err.data.dir}
          </p>
        </div>
      </td>
      <td class="cell-6">
        <div class="flex justify-end ${iconStyles}">
          ${deleteButton.render({ dat: err, emit })}
        </div>
      </td>
    </tr>
  `
}
