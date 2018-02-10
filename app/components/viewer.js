import React from 'react'
import Dialog from './dialog'

const Viewer = ({ show, key, path, onExit }) => (
  <Dialog show={show} width='800' height='600' onExit={onExit}>
    OHAI
  </Dialog>
)

export default Viewer
