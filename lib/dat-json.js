var stringKey = require('dat-encoding').toStr
var path = require('path')
var fs = require('fs')

module.exports = function (dat) {
  return {
    read: function (cb) {
      // dat.json
      // reads to dat.meta if exists
      // (TODO: move to module & validate dat.json)
      fs.readFile(datJsonFile(dat), 'utf8', function (err, body) {
        if (err) return cb(err)
        if (!body) return cb(null, {})
        var meta
        try {
          meta = JSON.parse(body)
        } catch (e) {
          return cb(new Error('Error parsing the dat.json file.'))
        }
        cb(null, meta)
      })
    },
    write: function (defaults, cb) {
      if (typeof defaults === 'function') {
        cb = defaults
        defaults = {}
      }
      dat.metadata = {
        title: defaults.title || path.basename(dat.path),
        url: defaults.url,
        author: defaults.author || 'Anonymous'
      }

      if (dat.key) dat.metadata.url = 'dat://' + stringKey(dat.key)
      fs.writeFile(datJsonFile(dat), JSON.stringify(dat.metadata), function (err) {
        if (err) return cb(err)
        cb(null, dat.metadata)
      })
    }
  }
}

function datJsonFile (dat) {
  return path.join(dat.path, 'dat.json')
}
