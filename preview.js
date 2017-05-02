// This file allows us to inspect all our components and all the states they
// can be in, inside of a single view. When you build a new component, add it
// here too. Run with "npm run preview"

var previewify = require('previewify')
var html = require('choo/html')
var css = require('sheetify')

var iconStyle = css`
  :host {
    height: 1.5rem;
  }

  :host svg {
    vertical-align: middle;
    width: 1.1em;
    max-height: 1.6em;
  }
`

var datImport = require('./elements/dat-import')
var tableRow = require('./elements/table-row')
var button = require('./elements/button')
var header = require('./elements/header')
var sprite = require('./elements/sprite')
var empty = require('./elements/empty')
var icon = require('./elements/icon')

css('dat-colors')
css('tachyons')
css('./assets/base.css')

var s = sprite()
var p = previewify({
  name: 'Dat desktop',
  url: 'https://github.com/datproject/dat-desktop'
})

p.component('button')
  .add('default', function () {
    return button('enhance!')
  })
  .add('red', function () {
    return button.red('abort!')
  })
  .add('green', function () {
    return button.green('engage!')
  })
  .add('icon', function () {
    return button.icon('Open in Finder', {
      icon: icon('open-in-finder'),
      class: iconStyle
    })
  })

p.component('dat-import')
  .add('default', function () {
    return datImport({ onsubmit: onsubmit })
    function onsubmit () {
    }
  })

p.component('empty')
  .add('default', function () {
    return empty()
  })

p.component('header')
  .add('pending', function () {
    return header({
      isReady: false,
      onimport: function () {},
      oncreate: function () {}
    })
  })
  .add('ready', function () {
    return header({
      isReady: true,
      onimport: function () {},
      oncreate: function () {}
    })
  })

p.component('icon')
  .add('default', function () {
    var icons = []
    for (var i = 0, len = s.childNodes.length; i < len; i++) {
      var node = s.childNodes[i]
      var id = node.getAttribute('id').replace(/^daticon-/, '')
      icons.push(icon(id, { class: iconStyle }))
    }

    return html`
      <div class="flex">
        ${icons}
      </div>
    `
  })

p.component('modal')
  .add('confirm', function () {
  })
  .add('crash', function () {
  })
  .add('error', function () {
  })
  .add('warn', function () {
  })
  .add('link', function () {
  })

p.component('table-row')
  .add('error', function () {
    var dat = new Error('oh no, example error!')
    var state = {}
    var emit = function () {}
    var row = tableRow()
    return row(dat, state, emit)
  })

var tree = p.start()
document.body.appendChild(s)
document.body.appendChild(tree)
