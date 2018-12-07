'use strict'

import React from 'react'
import * as Button from './button'
import Icon from './icon'
import { resolve } from 'path'
import { shell } from 'electron'

const FinderButton = ({ dat, onClick }) => (
  <Button.Icon
    icon={<Icon name='open-in-finder' />}
    className='row-action btn-finder'
    onClick={(e) => {
      e.stopPropagation()
      shell.openExternal(`file://${resolve(dat.path)}`, () => {})
    }}
  />
)

export default FinderButton
