'use strict'

import React from 'react'
import styled from 'styled-components'
import Icon from './icon'
import * as Button from './button'

const Inner = styled.div`
  min-width: 25rem;
  max-width: 32rem;
  padding: 2rem 2.5rem 2rem;
  background-color: var(--color-white);
  box-shadow: 0 1.2rem 2.4rem rgba(0,0,0,.5);
  .exit {
    border: none;
    color: var(--color-neutral-40);
  }
  .exit:hover,
  .exit:focus {
    color: var(--color-neutral);
  }
  .icon-cross {
    vertical-align: middle;
    width: 1.6em;
    max-height: 1.6em;
    transition: color .025s ease-out;
    margin-right: auto;
    margin-left: auto;
  }
`

const LabelInput = styled.label`
  --input-height: 3rem;
  --icon-height: 1.2rem;
  --button-width: 3rem;
  height: var(--input-height);
  border: 0;
  .dat-input-button {
    width: var(--button-width);
    height: calc(var(--input-height) - 2px);
    top: 1px;
    right: 1px;
    bottom: 1px;
    background-color: var(--color-neutral-10);
    border: none;
    color: var(--color-neutral-30);
    &:hover,
    &:focus {
      outline: none;
      color: var(--color-green-hover);
    }
  }
  .icon-link,
  .icon-clipboard {
    position: absolute;
    top: 0;
    bottom: 0;
    padding-top: calc(var(--icon-height) - .35rem);
    padding-left: .75rem;
    pointer-events: none;
    display: block;
    width: var(--icon-height);
    height: var(--icon-height);
    transition: color .025s ease-out;
  }
  .icon-link {
    left: 0;
    color: var(--color-neutral-30);
  }
  .icon-clipboard {
    right: .8rem;
  }
  .dat-input-input {
    width: 100%;
    height: var(--input-height);
    padding-right: var(--button-width);
    padding-left: 2.5rem;
    font-size: 1rem;
    font-weight: 600;
    border: 1px solid var(--color-neutral-20);
    background-color: var(--color-white);
    color: var(--color-green-hover);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    &:hover,
    &:focus {
      outline: none;
    }
  }
  .dat-input-check {
    color: var(--color-blue);
    top: 2rem;
  }
  .icon-check {
    width: var(--icon-height);
    height: .875rem;
    vertical-align: -.15rem;
    display: inline-block;
  }
  .confirmation {
    right: 0;
    opacity: 0;
    top: -.5rem;
    color: var(--color-blue);
  }
  .show-confirmation {
    top: -1.2rem;
    opacity: 1;
    transition: all .15s ease-out;
  }
`

export const Link = ({ link, copied, onCopy, onExit }) => (
  <div
    className="modal fixed items-center justify-center top-0 left-0 h-100 w-100 z-9999"
    style={{ display: link ? 'flex' : 'none' }}
  >
  	<Inner
      className="relative flex flex-column justify-center"
    >
      <h3 className="f4">
        Copy Dat Link
      </h3>
      <LabelInput for="dat-link" className="relative mt4 mb4">
        <p className={`f7 mt0 mb0 tr absolute confirmation ${copied ? 'show-confirmation' : ''}`}>
          <Icon name="check" />
          Link copied to clipboard
        </p>
        <input name="dat-link" type="text" value={link || ''} className="relative dib pa0 dat-input-input"></input>
        <Icon name="link" />
        <button className="absolute pointer dat-input-button" title="Copy to Clipboard" aria-label="Copy to Clipboard" onClick={() => onCopy(link)}>
          <Icon name="clipboard" />
        </button>
      </LabelInput>
      <p className="f7 color-neutral-70">
        Anyone with this link can view your Dat.
      </p>
      <button
        onClick={onExit}
        className="absolute pointer pa0 top-0 right-0 h2 w2 bg-transparent tc exit"
        aria-label="Close Modal"
      >
        <Icon name="cross" />
      </button>
    </Inner>
  </div>
)

export const Confirm = ({ dat, onConfirm, onExit }) => (
  <div
    className="modal fixed items-center justify-center top-0 left-0 h-100 w-100 z-9999"
    style={{ display: dat ? 'flex' : 'none' }}
  >
    <Inner
      className="relative flex flex-column justify-center"
    >
      <h3 className="f4">
        Remove Dat
      </h3>
      <p className="mt3 mb4 f7 color-neutral-70">
        Are you sure you want to remove this dat?
        <br />
        This can’t be undone.
      </p>
      <p>
        <Button.Green
          className="fr ml3 confirm-button"
          onClick={() => onConfirm(dat)}
        >
          Yes, Remove Dat
        </Button.Green>
        <Button.Plain
          className="fr cancel-button"
          onClick={onExit}
          autoFocus={true}
        >
          No, Cancel
        </Button.Plain>
      </p>
      <button
        onClick={onExit}
        className="absolute pointer pa0 top-0 right-0 h2 w2 bg-transparent tc exit"
        aria-label="Close Modal"
      >
        <Icon name="cross" />
      </button>
    </Inner>
  </div>
)
