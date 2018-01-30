'use strict'

import React from 'react'
import styled from 'styled-components'
import bytes from 'prettier-bytes'

const ProgressBar = styled.div`
  --progress-height: .5rem;
  --bar-height: var(--progress-height);
  --counter-width: 2.5rem;
  --tile-width: 28px;
  --stripe-width: 5px;
  min-width: 8rem;
  max-width: 24rem;
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

const ProgressSubline= styled.span`
  .arrow {
    vertical-align: top;
  }
`

const speed = n => `${bytes(n || 0)}/s`

const Status = ({ dat }) => {
  const stats = dat.stats
  const progress = Math.floor((dat.progress || 0) * 100)
  const progressbarLine = dat.state === 'loading'
    ? 'line-loading'
    : dat.state === 'paused' || dat.state === 'stale'
      ? 'line-paused'
      : 'line-complete'
  const netStats = dat.stats.network

  let progressText
  switch (dat.state) {
    case 'complete':
      progressText = `Complete. ↑ ${speed(netStats.up)}`
      break
    case 'loading':
      progressText = (
        <span>
          <span className="arrow">↓ </span> {speed(netStats.down)}<span className="arrow ml2">↑ </span> {speed(netStats.up)}
        </span>
      )
      break
    case 'stale':
      progressText = 'waiting for peers…'
      break
    default:
      progressText = 'Paused.'
  }
  

  return (
    <div>
      <ProgressBar>
        <div className="f6 f5-l counter">
          {progress}%
        </div>
        <div className="bar">
          <div className={`line ${progressbarLine}`} style={{width: `${progress}%`}}>
          </div>
        </div>
      </ProgressBar>
      <p className="f7 f6-l color-neutral-60 truncate">
        <ProgressSubline>
          {progressText}
        </ProgressSubline>
      </p>
    </div>
  )
}

export default Status