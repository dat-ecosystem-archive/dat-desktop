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
  var component = microcomponent('intro')
  component.on('render', render)
  component.on('update', update)
  return component

  function next () {
    component.render(Object.assign({}, component._state, { screen: component._state.screen + 1 }))
  }

  function render (state) {
    const onexit = this._state.onexit = state.onexit
    const screen = this._state.screen = state.screen || 0

    switch (screen) {
      case 0:
        return html`
          <main class="${intro}">
            <img src="./assets/intro-1.svg" alt="Dat Desktop Logo" class="absolute">
            <div class="${content}">
            </div>
            <div class="${footer}">
              ${button.green('Get Started', { onclick: next })}
            </div>
          </main>
        `
      case 1:
        return html`
          <main class="${intro}">
            <img src="./assets/intro-2.svg" alt="" class="absolute">
            <div class="${content}">
              <p class="mw5 f4">
                Hey there! This is a Dat.
              </p>
            </div>
            <div class="${footer}">
              ${button('Skip Intro', { onclick: onexit })}
              ${dots(screen)}
              ${button.green('Next', { onclick: next })}
            </div>
          </main>
        `
      case 2:
        return html`
          <main class="${intro}">
            <img src="./assets/intro-3.svg" alt="" class="absolute">
            <div class="${content}">
              <p class="mw5 f4">
                Think of it as a folder – with some magic.
              </p>
            </div>
            <div class="${footer}">
              ${button('Skip Intro', { onclick: onexit })}
              ${dots(screen)}
              ${button.green('Next', { onclick: next })}
            </div>
          </main>
        `
      case 3:
        return html`
          <main class="${intro}">
            <img src="./assets/intro-4.svg" alt="" class="absolute">
            <div class="${content}">
              <p class="mw5 f4">
                You can turn any folder on your computer into a Dat.
              </p>
            </div>
            <div class="${footer}">
              ${button('Skip Intro', { onclick: onexit })}
              ${dots(screen)}
              ${button.green('Next', { onclick: next })}
            </div>
          </main>
        `
      case 4:
        return html`
          <main class="${intro}">
            <img src="./assets/intro-5.svg" alt="" class="absolute">
            <div class="${content}">
              <p class="mw5 f4">
                Dats can be easily shared.
                Just copy the unique dat link and securely share it.
              </p>
            </div>
            <div class="${footer}">
              ${button('Skip Intro', { onclick: onexit })}
              ${dots(screen)}
              ${button.green('Next', { onclick: next })}
            </div>
          </main>
        `
      case 5:
        return html`
          <main class="${intro}">
            <img src="./assets/intro-6.svg" alt="" class="absolute">
            <div class="${content}">
              <p class="mw5 f4">
                You can also import existing Dats.
                Check out <a href="https://datproject.org/" class="color-green-disabled hover-color-green">datproject.org</a> to explore open datasets.
              </p>
            </div>
            <div class="${footer}">
              ${button('Skip Intro', { onclick: onexit })}
              ${dots(screen)}
              ${button.green('Done', { onclick: onexit })}
            </div>
          </main>
        `
    }
    throw new Error(`Unknown screen: ${component._state.screen}`)
  }

  function update (state) {
    return state.onexit !== this._state.onexit ||
      state.screen !== this._state.screen
  }
}
