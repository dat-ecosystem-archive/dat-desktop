const pre = document.createElement('pre')
pre.innerText = 'loading...'
document.body.appendChild(pre)

let current
let firstData

window.addEventListener('viewer:open', async (event) => {
  if (current) {
    current.destroy()
  }
  const file = event.file
  current = window.openFile(file)
  current.read(20, 60).then(data => {
    console.log('random bytes: ' + data)
  })
  pre.innerText = 'loading...'
  firstData = true
  const stream = current.createReadStream()
  stream.on('data', (buffer, enc) => {
    if (firstData) {
      pre.innerText = ''
      firstData = false
    }
    pre.innerText += buffer
  })
  stream.on('end', () => {
    console.log('completely read.')
  })
})

window.initViewer()
