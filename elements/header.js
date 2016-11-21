'use strict'

const yo = require('choo/html')
const button = require('./button')
const encoding = require('dat-encoding')
const icon = require('./icon')

module.exports = (props) => {
  const keydown = (e) => {
    if (e.keyCode === 13) {
      const link = e.target.value
      try {
        encoding.decode(link)
      } catch (err) {
        throw new Error('Invalid link')
      }
      e.target.value = ''
      props.download(link)
    }
  }
  return yo`
    <header class="dat-header dat-header--dark">
      <div class="dat-header__menu-trigger">
        ${icon({
          id: 'menu'
        })}
      </div>
      <div class="dat-header__actions">
        ${button({
          icon: 'create-new-dat',
          text: 'Create New Dat',
          klass: 'btn btn--transparent header-action header-action--add',
          click: props.create
        })}
        <div class="dat-import">
          <svg class="dat-import--icon">
            <use xlink:href="#daticon-link" />
          </svg>
          <input type="text" placeholder="Import dat" onkeydown=${keydown} class="dat-import--input">
        </div>
      </div>
    </header>
  `
}
