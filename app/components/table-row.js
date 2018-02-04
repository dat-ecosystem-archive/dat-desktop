'use strict'

import React from 'react'
import styled from 'styled-components'
import * as Button from './button'
import Icon from './icon'
import Status from './status'
import bytes from 'prettier-bytes'
import FinderButton from './finder-button'
import HexContent from './hex-content'
import TitleFieldContainer from '../containers/title-field'

const Tr = styled.tr`
  transition: background-color 0.025s ease-out;
  &:hover,
  &:focus {
    background-color: var(--color-neutral-04);
    cursor: pointer;
  }
  .cell-1 {
    width: 4rem;
  }
  .cell-2 {
    width: 14rem;
    max-width: 12rem;
    @media (min-width: 768px) {
      max-width: 20rem;
    }
    @media (min-width: 1280px) {
      max-width: 24rem;
    }
  }
  .cell-3 {
    width: 15rem;
  }
  .cell-4 {
    width: 4.5rem;
    white-space: nowrap;
  }
  .cell-5 {
    width: 4.5rem;
    white-space: nowrap;
  }
  .cell-6 {
    width: 10.25rem;
  }
  .cell-truncate {
    width: 100%;
  }
`

const IconContainer = styled.div`
  .row-action {
    height: 1.5rem;
    display: inline-block;
    color: var(--color-neutral-20);
    svg {
      vertical-align: middle;
      width: 1.1em;
      max-height: 1.6em;
      @media (min-width: 960px) {
        width: 1.4em;
      }
    }
    &:hover,
    &:focus {
      outline: none;
      color: var(--color-neutral-50);
    }
    &:first-child {
      padding-left: 0;
    }
    &:last-child {
      padding-right: 0;
    }
  }
  .icon-network {
    display: inline-block;
    color: var(--color-neutral-20);
    vertical-align: sub;
    width: 1em;
    svg polygon {
      fill: inherit;
    }
  }
`

const NetworkContainer = styled.td`
  vertical-align: top;
  svg {
    height: 1.5rem;
    display: inline-block;
    color: var(--color-neutral-20);
    vertical-align: top;
    width: 1.1em;
    max-height: 1.6em;
  }
  .network-peers-many {
    --polygon-1-color: var(--color-green);
    --polygon-2-color: var(--color-green);
    --polygon-3-color: var(--color-green);
  }
  .network-peers-1 {
    --polygon-1-color: var(--color-yellow);
    --polygon-2-color: var(--color-yellow);
  }
  .network-peers-0 {
    --polygon-1-color: var(--color-red);
  }
`

const NetworkIcon = ({ dat }) => {
  const iconClass =
    dat.peers === 0
      ? 'network-peers-0'
      : dat.peers === 1 ? 'network-peers-1' : 'network-peers-many'
  return <Icon name='network' className={iconClass} />
}

const LinkButton = ({ ...props }) => (
  <Button.Icon icon={<Icon name='link' />} className='row-action' {...props} />
)

const DeleteButton = ({ ...props }) => (
  <Button.Icon
    icon={<Icon name='delete' />}
    className='row-action'
    {...props}
  />
)

const Row = ({ dat, shareDat, onDeleteDat, inspectDat, onTogglePause }) => (
  <Tr
    onClick={ev => {
      if (
        ev.target.tagName === 'SVG' ||
        ev.target.tagName === 'use' ||
        ev.target.tagName === 'INPUT'
      ) {
        return
      }
      inspectDat(dat.key)
    }}
  >
    <td className='cell-1'>
      <div className='w2 center' onClick={() => onTogglePause(dat)}>
        <HexContent dat={dat} />
      </div>
    </td>
    <td className='cell-2'>
      <div className='cell-truncate'>
        <TitleFieldContainer dat={dat} />
        <p className='f7 f6-l color-neutral-60 truncate'>
          <span className='author'>
            {dat.metadata.author || 'Anonymous'} •{' '}
          </span>
          <span className='title'>
            {dat.writable ? 'Read & Write' : 'Read-only'}
          </span>
        </p>
      </div>
    </td>
    <td className='cell-3'>
      <Status dat={dat} />
    </td>
    <td className='f6 f5-l cell-4 size'>{bytes(dat.stats.length || 0)}</td>
    <NetworkContainer className='cell-5'>
      <NetworkIcon dat={dat} />
      <span className='network v-top f6 f5-l ml1'>{dat.peers}</span>
    </NetworkContainer>
    <td className='cell-6'>
      <IconContainer className='flex justify-end'>
        <FinderButton dat={dat} />
        <LinkButton onClick={() => shareDat(`dat://${dat.key}`)} />
        <DeleteButton onClick={() => onDeleteDat(dat.key)} />
      </IconContainer>
    </td>
  </Tr>
)

export default Row
