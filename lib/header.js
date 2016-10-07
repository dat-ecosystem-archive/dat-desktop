'use strict'

const yo = require('yo-yo')
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
      <div class="dat-header__title">All Dats</div>
      <div class="dat-header__actions">
        <div class="dat-button">
          ${button({
            icon: 'create-new-dat',
            text: 'Create New Dat',
            klass: 'btn btn--green',
            click: props.create
          })}
        </div>
        <div class="dat-import">
          <div class="dat-import--icon">
            <img src="./public/img/link.svg" />
          </div>
          <input type="text" placeholder="Import dat" onkeydown=${keydown} class="dat-import--input">
        </div>
      </div>
    </header>
  `
}
