var html = require('choo/html')
var css = require('sheetify')
var microcomponent = require('microcomponent')

var button = require('./button')

module.exports = IntroScreen

const intro = css`
  :host {
    position: relative;
    height: 100vh;
    background-color: var(--color-neutral);
    color: var(--color-white);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    -webkit-app-region: drag;
    overflow: hidden;
  }
`
const content = css`
  :host {
    position: relative;
    flex: 1;
    width: 100vw;
    padding: 3rem 2rem;
  }
`

const footer = css`
  :host {
    position: relative;
    width: 100vw;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    button {
      min-width: 5rem;
    }
  }
`
const image = css`
  :host {
    max-width: 100vw;
    max-height: 100vh;
  }
`

const dotsStyles = css`
  :host {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .dot {
      width: .5rem;
      height: .5rem;
      margin: .25rem;
      border-radius: 50%;
      background-color: var(--color-black);
    }
    .active {
      background-color: var(--color-blue);
    }
  }
`

function dots (screen) {
  return html`
    <div class="${dotsStyles}"">
      ${Array(5).fill(null).map(function (_, i) {
        var className = 'dot'
        if (i === screen - 1) className += ' active'
        return html `<div class=${className}></div>`
      })}
    </div>
  `
}

function IntroScreen () {
  var component = microcomponent({
    name: 'intro',
    state: {
      screen: 0
    }
  })
  component.on('render', render)
  component.on('update', update)
  component.on('load', load)
  component.on('unload', unload)
  return component

  function next () {
    component.state.screen++
    component.state.nextScreen = true
    component.props.onupdate()
  }

  function render () {
    var { onOpenHomepage, onexit } = this.props
    var screen = this.state.screen

    function openHomepage (ev) {
      ev.preventDefault()
      onOpenHomepage()
    }

    return html`
      <main class="${intro}">
        <img src="./assets/intro-${screen + 1}.svg" alt="" class="absolute ${image}">
        <div class="${content}">
          ${{
            1: html`
                <p class="mw5 f4">
                  Hey there! This is a Dat.
                </p>
              `,
            2: html`
                <p class="mw5 f4">
                  Think of it as a folder – with some magic.
                </p>
              `,
            3: html`
                <p class="mw5 f4">
                  You can turn any folder on your computer into a Dat.
                </p>
              `,
            4: html`
                <p class="mw5 f4">
                  Dats can be easily shared.
                  Just copy the unique dat link and securely share it.
                </p>
              `,
            5: html`
                <p class="mw5 f4">
                  You can also import existing Dats.
                  Check out <a href="https://datproject.org/" class="color-green-disabled hover-color-green" onclick=${openHomepage}>datproject.org</a> to explore open datasets.
                </p>
              `
          }[screen]}
        </div>
        ${screen === 0
          ? button.green('Get Started', { onclick: next, class: 'mt2 mb5 relative' })
          : html`
            <div class="${footer}">
                ${button('Skip Intro', { onclick: onexit })}
                ${dots(screen)}
                ${screen < 5
                  ? button.green('Next', { onclick: next })
                  : button.green('Done', { onclick: onexit })}
              </div>
            `}
      </main>
    `
  }

  function update () {
    if (this.state.nextScreen) {
      this.state.nextScreen = false
      return true
    }
    return false
  }

  function load () {
    window.addEventListener('keydown', onkeydown)
  }

  function unload () {
    window.removeEventListener('keydown', onkeydown)
  }

  function onkeydown (ev) {
    if (ev.code !== 'Escape') return
    window.removeEventListener('keydown', onkeydown)
    component.props.onexit()
  }
}
