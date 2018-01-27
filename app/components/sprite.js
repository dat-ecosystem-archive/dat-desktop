'use strict'

import React from 'react'
import datIcons from 'dat-icons/raw'

const Sprite = () => (
  <div dangerouslySetInnerHTML={{__html: datIcons()}}></div>
)

export default Sprite