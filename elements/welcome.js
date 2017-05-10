var html = require('choo/html')
var css = require('sheetify')

var button = require('./button')

module.exports = WelcomeScreen

const welcome = css`
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

function WelcomeScreen (methods) {
  const onexit = methods.onexit
  const onLoad = methods.onload

  return html`
    <main class="${welcome}" onload=${onLoad}>
      <img src="./assets/logo-dat-desktop.svg" alt="" class="">
      <p class="mv4">
        Share data on the distributed web.
      </p>
      ${button.green('Get Started', { onclick: onexit })}
    </main>
  `
}
