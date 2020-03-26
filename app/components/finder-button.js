'use strict'

import React from 'react'
import * as Button from './button'
import Icon from './icon'
import { resolve } from 'path'
import { shell } from 'electron'
import { DAT_ENV } from '../consts/env'

const alt =
  {
    darwin: 'Finder',
    win32: 'Explorer'
  }[DAT_ENV.platform] || 'FileManager'

const FinderButton = ({ dat, onClick }) => (
  <Button.Icon
    icon={<Icon name='open-in-finder' />}
    className='row-action btn-finder'
    title={`Open in ${alt}`}
    onClick={ev => {
      ev.stopPropagation()
      shell.openExternal(`file://${resolve(dat.path)}`, () => {})
    }}
  />
)

export default FinderButton
