const browserify = require('browserify')
const bankai = require('bankai')
const assert = require('assert')
const http = require('http')
const path = require('path')

const client = path.join(__dirname, 'app.js')

module.exports = createServer

// start serving assets
// num -> null
function createServer (port) {
  assert.equal(typeof port, 'number', 'dat-desktop/server: port should be a number')

  const assets = bankai()
  const css = assets.css()
  const js = assets.js(browserify, client, { transform: ['bulkify'] })
  const html = assets.html()

  http.createServer((req, res) => {
    switch (req.url) {
      case '/': return html(req, res).pipe(res)
      case '/bundle.js': return js(req, res).pipe(res)
      case '/bundle.css': return css(req, res).pipe(res)
      default: {
        res.statusCode = 404
        res.end('404 not found')
        break
      }
    }
  }).listen(port)
}
