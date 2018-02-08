import React from 'react'
import Dialog from './dialog'

const Viewer = ({ onExit }) => (
  <Dialog show={true} width=800 height=600 onExit={onExit}>
    OHAI
  </Dialog>
)

export default Viewer