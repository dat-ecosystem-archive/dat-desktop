const http = require('http')
const fs = require('fs')
const request = require('hyperquest')

module.exports = (url, cb) {
  const escape = str => str.replace(/\/:\./g, '-')
  const dir = `/tmp/${escape(url)}`
  fs.mkdir(dir, err => {
    if (err && err.code !== 'ENOENT') return cb(err)
    const server = http.createServer((req, res) => {
      const file = `${dir}/${escape(req.url)}`
      fs.stat(file, err => {
        if (!err) return fs.createReadStream(file).pipe(res)
        const ws = fs.createWriteStream(file)
        request(`${url}${req.url}`).pipe(ws)
        fs.on('finish', () => {
          fs.createReadStream(file).pipe(res)
        })
      })
    })
    server.listen(() => cb(null, `http://localhost:${server.address().port}`))
  })
}
