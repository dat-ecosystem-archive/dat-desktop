'use strict'

import React from 'react'
import styled from 'styled-components'

const Svg = styled.svg`
  display: block;
  fill: currentColor;
`

const Icon = ({ name, ...props }) => (
  <Svg viewBox="0 0 16 16" {...props} className={`icon-${name} ${props.className || ''}`}>
    <use xlinkHref={`#daticon-${name}`} />
  </Svg>
)

export default Icon