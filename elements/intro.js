var html = require('choo/html')
var css = require('sheetify')
var microcomponent = require('microcomponent')

var button = require('./button')

module.exports = IntroScreen

const intro = css`
  :host {
    height: 100vh;
    background-color: var(--color-neutral);
    color: var(--color-white);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    -webkit-app-region: drag;
  }
`

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

    switch (component._state.screen) {
      case 0:
        return html`
          <main class="${intro}">
            <img src="./assets/logo-dat-desktop.svg" alt="" class="">
            ${button.green('Get Started', { onclick: next })}
          </main>
        `
      case 1:
        return html`
          <main>
            ${button.green('Next', { onclick: next })}
            ${button.green('Skip Intro', { onclick: onexit })}
          </main>
        `
      case 2:
        return html`
          <main>
            ${button.green('Next', { onclick: next })}
            ${button.green('Skip Intro', { onclick: onexit })}
          </main>
        `
      case 3:
        return html`
          <main>
            ${button.green('Next', { onclick: next })}
            ${button.green('Skip Intro', { onclick: onexit })}
          </main>
        `
      case 4:
        return html`
          <main>
            ${button.green('Next', { onclick: next })}
            ${button.green('Skip Intro', { onclick: onexit })}
          </main>
        `
      case 5:
        return html`
          <main>
            ${button.green('Done', { onclick: onexit })}
          </main>
        `
    }
    throw new Error(`Unknown screen: ${component._state.screen}`)
  }

  function update (state) {
    return state.onexit !== this._state.onexit
      || state.screen !== this._state.screen
  }
}
