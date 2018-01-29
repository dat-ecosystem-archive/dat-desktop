'use strict'

import React from 'react'
import styled from 'styled-components'

const BaseButton = styled.button`
  text-transform: uppercase;
  letter-spacing: .025em;
  cursor: pointer;
  background-color: transparent;
  .icon-only {
    .btn-text { display: none }
  }
`

const HeaderButton = BaseButton.extend`
  color: var(--color-neutral-30);
  :hover, :focus {
    color: var(--color-white);
  }
`

var PlainButton = styled.button`
  padding: .5rem .75rem;
  font-size: .75rem;
  background-color: transparent;
  color: var(--color-neutral-40);
  :hover,
  :focus {
    color: var(--color-neutral-70);
  }
`

var GreenButton = styled.button`
  padding: .5rem .75rem;
  font-size: .75rem;
  background-color: var(--color-green);
  color: var(--color-neutral-04);
  :hover,
  :focus {
    background-color: var(--color-green-hover);
    color: var(--color-white);
  }
`

var RedButton = styled.button`
  padding: .5rem .75rem;
  font-size: .75rem;
  background-color: var(--color-red);
  color: var(--color-neutral-04);
  :hover,
  :focus {
    background-color: var(--color-red-hover);
    color: var(--color-white);
  }
`

const InnerWrapper = styled.div`
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`

export const Header = ({ children, icon, ...props }) => (
  <HeaderButton {...props}>
    <InnerWrapperComponent icon={icon}>
      {children}
    </InnerWrapperComponent>
  </HeaderButton>
)

export const Icon = ({ icon, ...props }) => (
  <BaseButton {...props}>
    <InnerWrapper>
      {icon}
    </InnerWrapper>
  </BaseButton>
)

export const Plain = ({ children, ...props }) => (
  <PlainButton {...props}>
    <InnerWrapperComponent>
      {children}
    </InnerWrapperComponent>
  </PlainButton>
)

export const Green = ({ children, icon, ...props }) => (
  <GreenButton {...props}>
    <InnerWrapperComponent icon={icon}>
      {children}
    </InnerWrapperComponent>
  </GreenButton>
)

export const Red = ({ children, icon, ...props }) => (
  <RedButton {...props}>
    <InnerWrapperComponent icon={icon}>
      {children}
    </InnerWrapperComponent>
  </RedButton>
)

const InnerWrapperComponent = ({ children, icon }) => (
  <InnerWrapper>
    {icon}
    <span className='btn-text ml1'>
      {children}
    </span>
  </InnerWrapper>
)
