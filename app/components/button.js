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

const InnerWrapper = styled.div`
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`

export const Header = ({ children, icon, ...props }) => (
  <HeaderButton {...props}>
    <InnerWrapper>
      {icon}
      <span className="btn-text ml1">
        {children}
      </span>
    </InnerWrapper>
  </HeaderButton>
)

export const Icon = ({ icon, ...props }) => (
  <BaseButton {...props}>
    <InnerWrapper>
      {icon}
    </InnerWrapper>
  </BaseButton>
)