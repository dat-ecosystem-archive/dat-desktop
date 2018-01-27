'use strict'

import React from 'react'
import styled from 'styled-components'
import { default as DatImport } from '../containers/dat-import'
import * as Button from './button'
import Icon from './icon'

const Container = styled.header`
  height: 2.5rem;
  padding: .25rem .75rem;
  -webkit-app-region: drag;
  background-color: var(--color-neutral);
  color: var(--color-white);
`

const Header = ({ onSubmit }) => (
  <Container>
    <div className="fr relative">
      <DatImport />
      <Button.Header
        icon={<Icon name="create-new-dat" style={{width: '1.2em'}} />}
        className="ml2 ml3-l b--transparent v-mid color-neutral-30 hover-color-white f7 f6-l"
      >
        Share Folder
      </Button.Header>
    </div>
  </Container>
)

export default Header