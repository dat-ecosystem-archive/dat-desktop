import React from 'react'
import Dialog from './dialog'

const Viewer = ({ onExit }) => (
  <Dialog show width='800' height='600' onExit={onExit}>
    OHAI
  </Dialog>
)

export default Viewer
