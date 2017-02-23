const html = require('choo/html')
const css = require('sheetify')

const progressbar = css`
  :host {
    --progress-height: .5rem;
    --bar-height: var(--progress-height);
    --counter-width: 2.5rem;

    min-width: 8rem;
    overflow: hidden;
    padding-top: .85rem;
    padding-bottom: .5rem;
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
      --tile-width: 28px;
      --stripe-width: 5px;
      @keyframes move-bg {
        0% {
          background-position: var(--tile-width) 0;
        }
        100% {
          background-position: 0 0;
        }
      };
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
`
module.exports = function (dat, stats, send) {
  if (dat.owner && dat.importer) {
    return html`<div>Watching for updates...</div>`
  }
  var progressbarLine = (stats.state === 'loading')
    ? 'line-loading'
    : (stats.state === 'paused')
      ? 'line-paused'
      : 'line-complete'
  var netStats = dat.stats.network
  var progressText = (stats.progress === 100)
    ? `Download Complete. ↑ ${speed(dat.network.uploadSpeed)}`
    : (dat.network.connected) ? `↓ ${speed(netStats.downloadSpeed)} ↑ ${speed(netStats.uploadSpeed)}`
    : 'waiting for peers...'
  function speed (n) {
    return `${n || 0}kB/s`
  }

  return html`
    <div class="${progressbar}">
      <div class="counter">
        ${stats.progress}%
        ${progressText}
      </div>
      <div class="bar">
        <div class="line ${progressbarLine}" style="width: ${stats.progress}%">
        </div>
      </div>
    </div>
  `
}
