import React from 'react'
import styled from 'styled-components'
import bytes from 'prettier-bytes'

const StatusBar = styled.footer`
  position: fixed;
  z-index: 1;
  left: 0;
  bottom: 0;
  width: 100vw;
  min-width: 800px;
  padding: 0.5rem 1rem 0.75rem;
  background-color: var(--color-neutral-04);
  color: var(--color-neutral-60);
  & ~ main {
    margin-bottom: 3rem;
  }
`

export default function ({ up, down, show }) {
  if (!show) return null

  return (
    <StatusBar>
      <span className='f7 mr3'>Download: {bytes(down)}/s</span>
      <span className='f7'>Upload: {bytes(up)}/s</span>
    </StatusBar>
  )
}
