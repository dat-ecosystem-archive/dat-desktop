'use strict'

import React, { Fragment } from 'react'
import styled from 'styled-components'
import { toStr } from 'dat-encoding'
import bytes from 'prettier-bytes'
import Icon from './icon'
import FileList from './file-list'
import {
  Plain as PlainButton,
  Green as GreenButton,
  Text as TextButton
} from './button'
import SCREEN from '../consts/screen'

const DetailHeader = styled.header`
  height: 4rem;
  flex-shrink: 0;
  border-bottom: 1px solid var(--color-neutral-20);
`

const DetailFooter = styled.footer`
  flex-shrink: 0;
  border-top: 1px solid var(--color-neutral-20);
`

const Label = styled.div`
  min-width: 8rem;
  color: var(--color-neutral-60);
  text-align: right;
  padding: 0.25rem;
`

const Column = styled.div`
  width: 100%;
  overflow: hidden;
  padding: 0.25rem;
`

const Row = ({ children, label = null, ...props }) => {
  if (!children) return null
  return (
    <div className='flex mb2'>
      {label !== null && <Label className='f7 f6-l'>{label}</Label>}
      <Column className='bg-white f7 f6-l' {...props}>
        {children}
      </Column>
    </div>
  )
}

const Inspect = ({
  screen,
  show,
  dat,
  closeInspectDat,
  addDat,
  hideDownloadScreen,
  cancelDownloadDat,
  changeDownloadPath
}) => {
  if (!dat) return null

  const title = dat
    ? dat.metadata ? dat.metadata.title : dat.key
    : 'Fetching metadata …'
  const author = dat
    ? dat.metadata && dat.metadata.author ? dat.metadata.author : 'N/A'
    : '…'
  const description =
    dat.metadata && dat.metadata.description ? dat.metadata.description : 'N/A'
  const size =
    dat.stats && Number(dat.stats.length) === dat.stats.length
      ? bytes(dat.stats.length)
      : 0
  const peers = isNaN(parseInt(dat.peers)) ? '…' : dat.peers

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
          <Row label='Link:'>{toStr(dat.key)}</Row>
          <Row label='Size:'>{size}</Row>
          <Row label='Peers:'>{peers}</Row>
          <Row label='Author:'>{author}</Row>
          <Row label='Description:'>{description}</Row>
          <Row label='Download to:' className='flex bg-white'>
            <pre
              className='flex-auto f7 f6-l'
              style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {dat.path}
            </pre>
            <TextButton onClick={() => changeDownloadPath(dat.key)}>
              CHANGE...
            </TextButton>
          </Row>
          <Row label='Files:'>
            <FileList
              dat={dat}
              fallback={<div className='f7 f6-l pa2'>N/A</div>}
            />
          </Row>
        </div>
      </div>
      {screen === SCREEN.INSPECT && (
        <DetailFooter className='pa3 flex items-center justify-between bg-white'>
          <div className='flex ml2'>
            <PlainButton onClick={() => closeInspectDat()}>
              ← Back to Overview
            </PlainButton>
          </div>
        </DetailFooter>
      )}
      {screen === SCREEN.DOWNLOAD && (
        <DetailFooter className='pa3 flex items-center justify-between bg-white'>
          <p className='truncate'>Download this Dat now?</p>
          <div className='flex ml2'>
            <GreenButton
              onClick={() => {
                addDat({ key: dat.key, path: dat.path })
                hideDownloadScreen()
              }}
            >
              Download
            </GreenButton>
            <PlainButton
              onClick={() => {
                cancelDownloadDat(dat.key)
                hideDownloadScreen()
              }}
            >
              Cancel
            </PlainButton>
          </div>
        </DetailFooter>
      )}
    </main>
  )
}

export default Inspect
