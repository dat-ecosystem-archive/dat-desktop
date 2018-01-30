import React from 'react'
import Swap from 'react-swap'
import * as Button from './button'
import Icon from './icon'

const HexContent = ({ dat }) => {
  let hex
  let onHover

  if (dat.state === 'loading') {
    hex = (
      <Button.Icon
        icon={<Icon name="hexagon-down" className="w2" />}
        className="color-blue hover-color-blue-hover ph0"
        data-swap-handler
      />
    )
  } else if (dat.state === 'paused') {
    hex = (
      <Button.Icon
        icon={<Icon name="hexagon-resume" className="w2" />}
        className="color-neutral-30 hover-color-neutral-40 ph0"
        data-swap-handler
      />
    )
  } else if (dat.state === 'complete') {
    hex = (
      <Button.Icon
        icon={<Icon name="hexagon-up" className="w2" />}
        className="color-green hover-color-green-hover ph0"
        data-swap-handler
      />
    )
  } else {
    hex = (
      <Button.Icon
        icon={<Icon name="hexagon-x" className="w2" />}
        className="color-neutral-30 hover-color-neutral-40 ph0"
        data-swap-handler
      />
    )
  }

  if (dat.state === 'paused') {
    onHover = (
      <Button.Icon
        icon={<Icon name="hexagon-x" className="w2" />}
        className="color-neutral-30 hover-color-neutral-40 ph0"
      />
    )
  } else {
    onHover = (
      <Button.Icon
        icon={<Icon name="hexagon-pause" className="w2" />}
        className="color-neutral-40 ph0"
      />
    )
  }

  return (
    <Swap isHover={true}>
      {hex}
      {onHover}
    </Swap>
  )
}

export default HexContent