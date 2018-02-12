import React from 'react'
import Dialog from '../dialog'

const Viewer = ({ show, dat, path, onExit }) => (
  <Dialog show={show} onExit={onExit}>
    OHAI
    <webview
      src={`app/viewers/text/index.html`}
      style={{ width: 800, height: 600 }}
      preload={`app/components/viewer/preload.js`}
    />
  </Dialog>
)

export default Viewer
