const encoding = require('dat-encoding')
const bytes = require('prettier-bytes')
const html = require('choo/html')
const css = require('sheetify')

const button = require('./button')
const icon = require('./icon')

css('dat-colors')

const table = css`
  :host {
    width: 100%;
  }
  :host th,
  :host td {
    padding-right: .75rem;
    padding-left: .75rem;
    font-size: .875rem;
  }
  :host th {
    height: 4rem;
    font-size: .8125rem;
    font-weight: normal;
    color: var(--color-neutral-60);
    border-bottom: 1px solid var(--color-neutral-20);
  }
  :host th:first-child {
    width: 3rem;
    padding: 0;
    border: none;
  }
  :host th:last-child {
    width: 8.25rem;
  }
  :host td {
    height: 4rem;
    vertical-align: middle;
    padding-top: 1rem;
  }
  :host tr:hover td {
    background-color: var(--color-neutral--04);
  }
  :host .cell-1 {
    width: 5rem;
  }
  :host .cell-2 {
    width: 17rem;
  }
  :host .cell-3 {
    width: 15rem;
  }
  :host .cell-4 {
    width: 5.5rem;
    white-space: nowrap;
  }
  :host .cell-5 {
    width: 6rem;
  }
  :host .cell-6 {
    width: 10.25rem;
  }
  :host .cell-truncate {
    width: 26vw;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  :host .row-action {
    height: 2rem;
    display: inline-block;
    border: 0;
    background: transparent;
    text-align: center;
    color: var(--color-neutral-20);
  }
  :host .row-action svg {
    vertical-align: middle;
    width: 1.1em;
    max-height: 1.6em;
  }
  :host .row-action:hover,
  :host .row-action:focus {
    outline: none;
    color: var(--color-neutral-50);
  }
  :host .row-action:first-child {
    padding-left: 0;
  }
  :host .row-action:last-child {
    padding-right: 0;
  }
  :host .icon-network {
    color: var(--color-neutral-20);
    vertical-align: middle;
    width: 1.1em;
    max-height: 1.6em;
  }
`

const progressBar = css`
  :host {
    --progress-height: .5rem;
    --bar-height: var(--progress-height);
    --counter-width: 2.5rem;

    min-width: 8rem;
    overflow: hidden;
    padding-top: .85rem;
    padding-bottom: .5rem;
  }

  :host .bar {
    height: var(--progress-height);
    width: calc(100% - var(--counter-width));
    float: left;
    overflow: hidden;
    background-color: var(--color-neutral-20);
    border-radius: 2px;
  }

  :host .line {
    width: 0%;
    height: var(--progress-height);
    background-color: var(--color-blue);
    border-radius: 2px;
  }

  @keyframes move-bg {
    0% {
      background-position: var(--tile-width) 0;
    }
    100% {
      background-position: 0 0;
    }
  }

  :host .line-loading {
    --tile-width: 28px;
    --stripe-width: 5px;

    overflow: hidden;
    position: relative;
    height: var(--bar-height);
  }
  :host .line-loading:before {
    content: '';
    width: 100%;
    height: var(--bar-height);
    position: absolute;
    top: 0;
    left: 0;
    background-image: repeating-linear-gradient(
      -45deg,
      transparent,
      transparent var(--stripe-width),
      rgba(255,255,255,.1) var(--stripe-width),
      rgba(255,255,255,.1) calc(2 * var(--stripe-width))
    );
    background-size: var(--tile-width) var(--bar-height);
    animation: move-bg .75s linear infinite;
  }

  :host .line-complete {
    background-color: var(--color-green);
  }

  :host .line-paused {
    background-color: var(--color-neutral-60);
  }

  :host .counter {
    float: right;
    min-width: var(--counter-width);
    margin-top: -.4rem;
    text-align: right;
    font-size: .875rem;
  }
`

module.exports = tableElement

function tableElement (dats, send) {
  return html`
    <table class="w-100 collapse ${table}">
      <thead>
        <tr>
          <th class="cell-1"></th>
          <th class="tl cell-2">Link</th>
          <th class="tl cell-3">Download</th>
          <th class="tr cell-4">Size</th>
          <th class="tr cell-5">Network</th>
          <th class="cell-6"></th>
        </tr>
      </thead>
      <tbody>
        ${createTable(dats, send)}
      </tbody>
    </table>
  `
}

// create the inner table element
// ([obj], fn) -> html
function createTable (dats, send) {
  return dats.map(dat => {
    const stats = dat.hyperStats && dat.hyperStats.get()
    const progress = stats
      ? stats.blocksTotal
        ? Math.round(((stats.blocksProgress / stats.blocksTotal) | 0) * 100)
        : 100
      : 0

    const state = progress < 1
      ? dat.stats.peers > 0
        ? 'loading'
        : 'paused'
      : 'complete'

    const hexContent = {
      loading: icon({id: 'hexagon-down', cls: 'color-blue'}),
      paused: icon({id: 'hexagon-pause', cls: 'color-neutral-30'}),
      complete: icon({id: 'hexagon-up', cls: 'color-green'})
    }[state]

    return html`
      <tr>
        <td class="cell-1">
          <div class="w2 pa1 center">
            ${hexContent}
          </div>
        </td>
        <td class="cell-2">
          <div class="cell-truncate">
            ${dat.title || `#${encoding.encode(dat.key)}`}
            <br />
            <span class="f7">
              ${dat.owner
                ? 'Read & Write'
                : 'Read-only'}
              ${dat.title && `· #${encoding.encode(dat.key)}`}
            </span>
          </div>
        </td>
        <td class="cell-3">
          <div class="${progressBar}">
            <div class="counter">
              ${progress}%
            </div>
            <div class="bar">
              <div
                class="line line-${state}"
                style="width: ${progress}%"
              ></div>
            </div>
          </div>
        </td>
        <td class="tr cell-4">
          ${bytes(dat.stats.bytesTotal)}
        </td>
        <td class="tr cell-5">
          ${icon({
            id: 'network'
          })}
          ${dat.stats.peers}
        </td>
        <td class="cell-6">
          <div class="flex justify-end">
            ${button({
              icon: 'open-in-finder',
              text: '',
              cls: 'row-action',
              click: () => send('app:open', dat)
            })}
            ${button({
              icon: 'link',
              text: '',
              cls: 'row-action',
              click: () => send('app:share', dat)
            })}
            ${button({
              icon: 'delete',
              text: '',
              cls: 'row-action',
              click: () => send('app:delete', dat)
            })}
          </div>
        </td>
      </tr>
    `
  })
}
