const { ipcRenderer } = require('electron')

const callbacks = []

window.read = (start, end, cb) =>
  send('read', [start, end], (err, str) => {
    if (err) return cb(err)
    cb(null, Buffer.from(str, 'hex'))
  })
window.size = cb => send('size', [], cb)

const send = (cmd, args, cb) => {
  const id = callbacks.length
  callbacks.push({ id, cb })
  ipcRenderer.sendToHost('req', { cmd, args, id })
}

ipcRenderer.on('res', (_, id, err, ...args) => {
  const cb = callbacks.find(o => o.id === id).cb
  cb(err, ...args)
})
