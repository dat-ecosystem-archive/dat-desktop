'use strict'

const yo = require('yo-yo')
const button = require('./button')
const css = require('yo-css')
const encoding = require('dat-encoding')

const style = {

}

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
    <header style=${css(style)} class="dat-header dat-header--dark">
      <div class="dat-header__menu-trigger">
        <img src="./public/img/menu.svg" />
      </div>
      <div class="dat-header__title">All Dats</div>
      <div class="dat-header__actions">
        <div class="dat-button">
          ${button({
            icon: './public/img/create-new-dat.svg',
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
