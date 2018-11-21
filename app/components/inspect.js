'use strict'

import React from 'react'
import styled from 'styled-components'
import { toStr } from 'dat-encoding'
import bytes from 'prettier-bytes'
import FileList from './file-list'
import Icon from './icon'
import { Plain as PlainButton } from './button'

const DetailHeader = styled.header`
  height: 4rem;
  flex-shrink: 0;
  border-bottom: 1px solid var(--color-neutral-20);
`

const DetailFooter = styled.footer`
  flex-shrink: 0;
  border-top: 1px solid var(--color-neutral-20);
`

const LabelStyle = styled.div`
  font-size: 0.75rem;
  min-width: 8rem;
  color: var(--color-neutral-60);
`

const Label = ({ children }) => (
  <LabelStyle className='mb2'>{children}</LabelStyle>
)

const Inspect = ({ dat, closeInspectDat, addFilesToDat }) => {
  if (!dat) return null

  const title = dat
    ? dat.metadata ? dat.metadata.title : dat.key
    : 'Fetching metadata …'
  const author = dat
    ? dat.metadata && dat.metadata.author ? dat.metadata.author : 'N/A'
    : '…'
  const description = dat
    ? dat.metadata && dat.metadata.description
      ? dat.metadata.description
      : 'N/A'
    : '…'
  const size =
    Number(dat.stats.length) === dat.stats.length ? bytes(dat.stats.length) : 0
  const peers = dat ? dat.peers : '…'

  return (
    <main className='flex flex-column'>
      <div className='flex flex-column flex-auto'>
        <DetailHeader className='flex items-center'>
          <div className='w3'>
            <Icon name='hexagon-down' className='w2 center color-neutral-30' />
          </div>
          <h2 className='f5 normal truncate pr3 w-90'>{title}</h2>
        </DetailHeader>
        <div className='flex-auto pa3 pl5 bg-neutral-04 overflow-y-auto'>
          <div className='flex'>
            <Label>Link:</Label>
            <div className='is-selectable f7 f6-l mb2 mw6 truncate'>
              {toStr(dat.key)}
            </div>
          </div>
          <div className='flex'>
            <Label>Size:</Label>
            <div className='is-selectable f7 f6-l mb2 mw6'>{size}</div>
          </div>
          <div className='flex'>
            <Label>Peers:</Label>
            <div className='is-selectable f7 f6-l mb2 mw6'>{peers}</div>
          </div>
          <div className='flex'>
            <Label>Author:</Label>
            <div className='is-selectable f7 f6-l mb2 mw6'>{author}</div>
          </div>
          <div className='flex'>
            <Label>Description:</Label>
            <div className='is-selectable f7 f6-l mb2 mw6'>{description}</div>
          </div>
          <div className='flex'>
            <Label>Download to:</Label>
            <div className='flex flex-auto items-center justify-between bg-white mb2 mw6'>
              <pre className='flex-auto ph2 is-selectable truncate f7 f6-l'>
                {dat.path}
              </pre>
            </div>
          </div>
          <div className='flex'>
            <Label>Files:</Label>
            <FileList dat={dat} />
          </div>
        </div>
      </div>
      <DetailFooter className='pa3 flex items-center justify-between bg-white'>
        <div className='flex ml2'>
          <PlainButton onClick={() => closeInspectDat()}>
            ← Back to Overview
          </PlainButton>
        </div>
      </DetailFooter>
    </main>
  )
}

export default Inspect
