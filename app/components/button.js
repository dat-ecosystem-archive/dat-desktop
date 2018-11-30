'use strict'

import React from 'react'
import styled from 'styled-components'

const BaseButton = styled.button.attrs(props => ({
  ...props,
  onClick: props => {
    if (props.trigger) {
      return function (e) {
        e.stopPropagation()
        props.trigger.apply(this, [e])
      }
    }
    return undefined
  }
}))`
  text-transform: uppercase;
  letter-spacing: 0.025em;
  cursor: pointer;
  background-color: transparent;
  .icon-only {
    .btn-text {
      display: none;
    }
  }
  :hover,
  :focus {
    outline: 0;
  }
`

const HeaderButton = styled(BaseButton)`
  color: var(--color-neutral-30);
  height: 2rem;
  :hover,
  :focus {
    color: var(--color-white);
  }
`

var PlainButton = styled(BaseButton)`
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  background-color: transparent;
  color: var(--color-neutral-40);
  :hover,
  :focus {
    color: var(--color-neutral-70);
  }
`

var TextButton = styled(BaseButton)`
  font-size: 0.75rem;
  background-color: transparent;
  color: var(--color-neutral-40);
  :hover,
  :focus {
    color: var(--color-neutral-70);
  }
`

var GreenButton = styled(BaseButton)`
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  background-color: var(--color-green);
  color: var(--color-neutral-04);
  :hover,
  :focus {
    background-color: var(--color-green-hover);
    color: var(--color-white);
  }
`

var RedButton = styled(BaseButton)`
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
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
    <InnerWrapperComponent icon={icon}>{children}</InnerWrapperComponent>
  </HeaderButton>
)

export const Icon = ({ icon, ...props }) => (
  <BaseButton {...props}>
    <InnerWrapper>{icon}</InnerWrapper>
  </BaseButton>
)

export const Plain = ({ children, ...props }) => (
  <PlainButton {...props}>
    <InnerWrapperComponent>{children}</InnerWrapperComponent>
  </PlainButton>
)

export const Text = ({ children, icon, ...props }) => (
  <TextButton {...props}>
    <InnerWrapperComponent icon={icon}>{children}</InnerWrapperComponent>
  </TextButton>
)

export const Green = ({ children, icon, ...props }) => (
  <GreenButton {...props}>
    <InnerWrapperComponent icon={icon}>{children}</InnerWrapperComponent>
  </GreenButton>
)

export const Red = ({ children, icon, ...props }) => (
  <RedButton {...props}>
    <InnerWrapperComponent icon={icon}>{children}</InnerWrapperComponent>
  </RedButton>
)

const InnerWrapperComponent = ({ children, icon }) => (
  <InnerWrapper>
    {icon}
    <span className='btn-text ml1'>{children}</span>
  </InnerWrapper>
)
