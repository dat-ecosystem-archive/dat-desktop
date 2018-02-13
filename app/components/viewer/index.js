import React from 'react'
import Dialog from '../dialog'

const Viewer = ({ show, dat, path, onExit }) => {
  const onref = webview => {
    webview.addEventListener('ipc-message', ev => {
      if (ev.channel !== 'req') return
      const { cmd, args, id } = ev.args[0]

      if (cmd === 'read') {
        const [start, end] = args
        dat.archive.open(path, 'r', (err, fd) => {
          if (err) return webview.send('res', id, err.message)

          const buf = Buffer.alloc(end - start)
          dat.archive.read(fd, buf, 0, end - start, start, err => {
            if (err) return webview.send('res', id, err.message)

            webview.send('res', id, null, buf.toString('hex'))
          })
        })
      } else if (cmd === 'size') {
        dat.archive.stat(path, (err, stat) => {
          if (err) return webview.send('res', id, err.message)
          webview.send('res', id, null, stat.size)
        })
      }
    })
    webview.addEventListener('console-message', e => {
      console.log(e.message)
    })
  }
  return (
    <Dialog show={show} onExit={onExit}>
      OHAI
      <webview
        src={`app/viewers/text/index.html`}
        style={{ width: 800, height: 600 }}
        preload={`app/components/viewer/preload.js`}
        ref={ref => ref && onref(ref)}
      />
    </Dialog>
  )
}

export default Viewer
