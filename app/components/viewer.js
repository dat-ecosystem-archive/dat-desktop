import React from 'react'
import Dialog from './dialog'

const Viewer = ({ show, dat, path, onExit }) => (
  <Dialog show={show} onExit={onExit}>
    OHAI
  </Dialog>
)

export default Viewer
