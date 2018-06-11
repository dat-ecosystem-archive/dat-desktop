import React from 'react'
import Dialog from '../dialog'
import url from 'url'

const streams = {}

const Viewer = ({ show, dat, path, onExit }) => {
  const datPath = `dat://${dat && dat.key.toString('hex')}/${path}#${dat &&
    dat.version}`
  const initFile = (datPath, cb) => {
    const parts = url.parse(datPath)
    // TODO: version is not considered ...
    if (parts.hostname !== dat.key.toString('hex')) { return cb(new Error('Dat already closed')) }
    dat.archive.stat(parts.path, cb)
  }
  const readFile = (datPath, start, end, cb) => {
    const parts = url.parse(datPath)
    // TODO: version is not considered ...
    if (parts.hostname !== dat.key.toString('hex')) { return cb(new Error('Dat already closed')) }

    // TODO: multiple reads on the same file should not open/close the file
    dat.archive.open(path, 'r', (err, fd) => {
      if (err) return cb(err)

      const buf = Buffer.alloc(end - start)
      dat.archive.read(
        fd,
        buf,
        0,
        buf.length,
        start,
        err => (err ? cb(err) : cb(null, buf))
      )
    })
  }
  const onref = webview => {
    webview.addEventListener('ipc-message', ev => {
      if (ev.channel === 'viewer:init') {
        webview.send('viewer:open', datPath)
        return
      }
      if (ev.channel === 'viewer:stream') {
        const { cmd, id, datPath, start, end } = ev.args[0]
        if (cmd === 'open') {
          const parts = url.parse(datPath)
          // TODO: version is not considered ...
          if (parts.hostname !== dat.key.toString('hex')) {
            return webview.send(
              'viewer:stream',
              id,
              new Error('Dat already closed')
            )
          }

          const stream = dat.archive.createReadStream(parts.path, {
            start,
            end
          })
          stream.on('data', data =>
            webview.send('viewer:stream', id, null, data.toString())
          )
          stream.on('error', error => webview.send('viewer:stream', id, error))
          stream.on('end', data => {
            delete streams[id]
            webview.send('viewer:stream', id, null, null)
          })
          streams[id] = stream
        }
        if (cmd === 'close') {
          const stream = streams[id]
          if (stream) stream.close()
        }
        return
      }
      if (ev.channel === 'viewer:exec') {
        const { cmd, id, args } = ev.args[0]
        const cb = (err, data) => {
          webview.send('viewer:exec', id, err, data)
        }
        if (cmd === 'init') {
          const [datPath] = args
          initFile(datPath, cb)
        } else if (cmd === 'read') {
          const [datPath, start, end] = args
          readFile(datPath, start, end, cb)
        }
      }
    })
    webview.addEventListener('console-message', e => {
      var srcFile = e.sourceId.replace(/^.*[\\/]/, '')
      const msg = `[webview@${srcFile}(${e.line})]: ${e.message}`
      if (e.level === 2) {
        console.error(msg)
      } else if (e.level === 1) {
        console.warn(msg)
      } else {
        console.log(msg)
      }
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
