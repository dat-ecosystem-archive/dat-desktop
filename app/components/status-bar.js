import React from 'react'
import styled from 'styled-components'
import bytes from 'prettier-bytes'

const StatusBar = styled.footer`
  width: 100%;
  min-width: 800px;
  height: 2.5rem;
  padding: 0.25rem 0.75rem;
  background-color: var(--color-neutral-04);
  color: var(--color-neutral-60);
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
