import React, { Fragment } from 'react'
import styled from 'styled-components'
import bytes from 'prettier-bytes'

const Bar = styled.div`
  position: fixed;
  left:0;
  bottom: 0;
  width: 100vw;
  padding: 0.5rem 1rem 0.75rem;
  background-color: var(--color-neutral-04);
  color: var(--color-neutral-60);
`

const StatusBar = ({ up, down, show }) => {
  if (!show) {
    return (
      <Fragment>
        <div />
      </Fragment>
    )
  }

  return (
    <Bar id='status-bar'>
      <span className='f7 mr3'>Download: {bytes(down)}/s</span>
      <span className='f7'>Upload: {bytes(up)}/s</span>
    </Bar>
  )
}

export default StatusBar
