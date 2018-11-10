'use strict'

import React from 'react'
import styled from 'styled-components'
import { transparentize } from 'polished'
import { neutral } from 'dat-colors'
import DatImport from '../containers/dat-import'
import * as Button from './button'
import Icon from './icon'

const Container = styled.header`
  height: 2.5rem;
  padding: 0.25rem 0.75rem;
  -webkit-app-region: drag;
  background-color: var(--color-neutral);
  color: var(--color-white);
  z-index: 4;
`

const HideLayer = styled.div`
  position: absolute;
  background: ${transparentize(0.85, neutral)};
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  z-index: 5;
`

const Header = ({ onShare, onMenu, onReport, menuVisible, version }) => {
  const toggleMenu = () => onMenu(!menuVisible)
  return (
    <Container>
      {menuVisible && <HideLayer onClick={toggleMenu} />}
      <div className='fr relative'>
        <DatImport />
        <Button.Header
          icon={<Icon name='create-new-dat' style={{ width: '1.2em' }} />}
          className='b--transparent v-mid color-neutral-30 hover-color-white f7 f6-l btn-share-folder'
          onClick={onShare}
        >
          Share Folder
        </Button.Header>
        <Button.Header
          icon={<Icon name='menu' style={{ width: '1.2em' }} />}
          className='ml2 v-mid color-neutral-20 hover-color-white pointer btn-toggle-menu'
          onClick={toggleMenu}
        />
        {menuVisible && (
          <div
            className='absolute right-0 br1 w5 pa3 bg-neutral'
            style={{ top: '3rem', zIndex: 6 }}
          >
            <h3 className='f6 f5-l mb2'>Dat Desktop {version}</h3>
            <p className='f6 f5-l mb3'>
              Dat Desktop is a peer to peer sharing app built for humans by
              humans.
            </p>
            <p className='f6 f5-l'>
              <a
                onClick={onReport}
                href='#'
                className='color-neutral-50  hover-color-neutral-70'
              >
                Report Bug
              </a>
            </p>
          </div>
        )}
      </div>
    </Container>
  )
}

export default Header
