var html = require('choo/html')
var css = require('sheetify')

var icon = require('../elements/icon')

module.exports = EmptyState

const skeleton = css`
  :host {
    position: relative;
    .skeleton {
      position: fixed;
      top: 3.5rem;
      left: 1.25rem;
      width: 232px;
      max-width: 100vw;
    }
    .dotted-lines {
      position: absolute;
      top: .25rem;
      right: 5.5rem;
      width: 17rem;
      z-index: 3;
    }
    .create-new-dat,
    .link {
      position: absolute;
      width: 15rem;
    }
    .create-new-dat {
      top: 14.5rem;
      right: 4rem;
      svg {
        display: inline-block;
        width: 2rem;
        height: 2rem;
      }
    }
    .link {
      top: 6rem;
      right: 8.5rem;
      color: red;
      svg {
        display: inline-block;
        width: 2rem;
        height: 2rem;
        margin-bottom: -.75rem;
      }
    }
  }
`

function EmptyState () {
  return html`
    <main class="${skeleton}">
      <img src="./assets/table-skeleton.svg" alt="" class="skeleton">
      <div class="tutorial">
        <img src="./assets/dotted-lines.svg" alt="" class="dotted-lines">
        <div class="link">
          ${icon('link', { class: 'color-blue-disabled' })}
          <h3 class="f4 ttu mt0 mb0 color-blue-disabled">
            Import Dat
          </h3>
          <p class="f7 color-neutral-40">
            Download an existing dataset
            <br>
            by entering its dat link…
          </p>
        </div>
        <div class="tr create-new-dat">
          ${icon('create-new-dat', { class: 'color-green-disabled' })}
          <h3 class="f4 ttu mt0 mb0 color-green-disabled">Create New Dat</h3>
          <p class="f7 color-neutral-40">
            … or select one of your local
            <br>
            datasets and start sharing it.
          </p>
        </div>
      </div>
    </main>
  `
}
