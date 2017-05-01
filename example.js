var previewify = require('previewify')
var css = require('sheetify')

var finderStyle = css`
  :host {
    height: 1.5rem;
  }

  :host svg {
    vertical-align: middle;
    width: 1.1em;
    max-height: 1.6em;
  }
`

var button = require('./elements/button')
var sprite = require('./elements/sprite')
var empty = require('./elements/empty')
var icon = require('./elements/icon')

css('dat-colors')
css('tachyons')
css('./assets/base.css')

var p = previewify({
  name: 'Dat desktop',
  url: 'https://github.com/datproject/dat-desktop'
})

p.component('empty')
  .add('default', function () {
    return empty()
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
      class: finderStyle
    })
  })

var tree = p.start()
document.body.appendChild(sprite())
document.body.appendChild(tree)
