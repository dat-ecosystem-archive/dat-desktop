'use strict'

import React from 'react'
import styled from 'styled-components'
import Icon from './icon'

const Label = styled.label`
  --icon-height: 1.2rem;
  color: var(--color-neutral-30);
  .icon-link {
    padding-top: .42rem;
    padding-left: .5rem;
    pointer-events: none;
    width: var(--icon-height);
    height: var(--icon-height);
  }
  input {
    height: 2rem;
    width: 7.25rem;
    padding-right: .5rem;
    padding-left: 2rem;
    border: 1px solid transparent;
    background-color: transparent;
    color: var(--color-neutral-30);
    opacity: 1;
    text-transform: uppercase;
    letter-spacing: .025em;
    transition-property: width;
    transition-duration: .15s;
    transition-timing-function: ease-in;
    &::-webkit-input-placeholder {
      color: var(--color-neutral-30);
      opacity: 1;
    }
    &:hover,
    &:hover::-webkit-input-placeholder,
    &:hover + svg {
      color: var(--color-white);
    }
    &:focus,
    &:active {
      width: 14rem;
      outline: none;
      background-color: var(--color-white);
      color: var(--color-neutral);
    }
    &:focus::-webkit-input-placeholder,
    &:active::-webkit-input-placeholder,
    &:focus + svg,
    &:active + svg {
      color: var(--color-neutral-50);
    }
  }
`

const DatImport = ({ onAddDat }) => {
  const onKeyDown = e => {
    const value = e.target.value
    if (e.key !== 'Enter' || !value) return
    e.target.value = ''
    onAddDat(value)
  }

  return (
    <Label for='dat-import' className='relative dib pa0 b--none'>
      <input name='dat-import'
        type='text'
        placeholder='Download'
        onKeyDown={onKeyDown}
        className='input-reset f7 f6-l'
        defaultValue='dat://40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9/'
      />
      <Icon name='link' className='absolute top-0 bottom-0 left-0' />
    </Label>
  )
}

export default DatImport
