const pre = document.createElement('pre')
pre.innerText = 'loading...'
document.body.appendChild(pre)

window.size((err, size) => {
  if (err) throw err
  window.read(0, size, (err, buf) => {
    if (err) throw err
    pre.innerText = buf.toString()
  })
})
