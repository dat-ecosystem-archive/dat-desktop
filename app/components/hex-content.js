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
      />
    )
  } else if (dat.paused) {
    hex = (
      <Button.Icon
        icon={<Icon name="hexagon-resume" className="w2" />}
        className="color-neutral-30 hover-color-neutral-40 ph0"
      />
    )
  } else if (dat.state === 'complete') {
    hex = (
      <Button.Icon
        icon={<Icon name="hexagon-up" className="w2" />}
        className="color-green hover-color-green-hover ph0"
      />
    )
  } else {
    hex = (
      <Button.Icon
        icon={<Icon name="hexagon-x" className="w2" />}
        className="color-neutral-30 hover-color-neutral-40 ph0"
      />
    )
  }

  if (!dat.paused) {
    onHover = (
      <Button.Icon
        icon={<Icon name="hexagon-pause" className="w2" />}
        className="color-neutral-40 ph0"
      />
    )
  } else {
    onHover = hex
  }

  return (
    <Swap isHover={true}>
      <div data-swap-handler>
        {hex}
      </div>
      <div>
        {onHover}
      </div>
    </Swap>
  )
}

export default HexContent