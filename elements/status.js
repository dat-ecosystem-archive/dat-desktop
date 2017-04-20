const html = require('choo/html')
const css = require('sheetify')

const progressbar = css`
  :host {
    --progress-height: .5rem;
    --bar-height: var(--progress-height);
    --counter-width: 2.5rem;
    --tile-width: 28px;
    --stripe-width: 5px;
    min-width: 8rem;
    overflow: hidden;
    padding-top: .4rem;
    .bar {
      height: var(--progress-height);
      width: calc(100% - var(--counter-width));
      float: left;
      overflow: hidden;
      background-color: var(--color-neutral-20);
      border-radius: 2px;
    }
    .line {
      width: 0%;
      height: var(--progress-height);
      background-color: var(--color-blue);
      border-radius: 2px;
    }
    .line-loading {
      overflow: hidden;
      position: relative;
      height: var(--bar-height);
      &:before {
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
    }
    .line-complete {
      background-color: var(--color-green);
    }
    .line-paused {
      background-color: var(--color-neutral-40);
    }
    .counter {
      float: right;
      min-width: var(--counter-width);
      margin-top: -.4rem;
      text-align: right;
      font-size: .875rem;
    }
  }
  @keyframes move-bg {
    0% {
      background-position: 28px 0;
    }
    100% {
      background-position: 0 0;
    }
  }
`

const progressSubline = css`
  :host {
    .arrow {
      vertical-align: top;
    }
  }
`

module.exports = function (dat, stats) {
  if (dat.owner && dat.importer) {
    return html`<div>Watching for updates…</div>`
  }
  var progress = Math.floor((dat.progress || 0) * 100)
  var progressbarLine = (!stats || stats.state === 'loading')
    ? 'line-loading'
    : (stats.state === 'paused' || stats.state === 'stale')
      ? 'line-paused'
      : 'line-complete'
  var netStats = dat.stats && dat.stats.network

  var progressText
  switch (stats && stats.state) {
    case 'complete':
      progressText = `Complete. ↑ ${speed(netStats.uploadSpeed)}`
      break
    case 'loading':
      progressText = html`
        <span>
          <span class="arrow">↓</span> ${speed(netStats.downloadSpeed)}<span class="arrow ml2">↑</span> ${speed(netStats.uploadSpeed)}
        </span>`
      break
    case 'stale':
      progressText = 'waiting for peers…'
      break
    default:
      progressText = 'Paused.'
  }
  function speed (n) {
    return `${Math.round((n || 0) / 1024)}kB/s`
  }

  return html`
    <div>
      <div class="${progressbar}">
        <div class="counter">
          ${progress}%
        </div>
        <div class="bar">
          <div class="line ${progressbarLine}" style="width: ${progress}%">
          </div>
        </div>
      </div>
      <p class="f7 color-neutral-60 truncate">
        <span class="${progressSubline}">
          ${progressText}
        </span>
      </p>
    </div>
  `
}
