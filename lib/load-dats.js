const db = require('./db')
const load = require('./load-dat')
const activate = require('./activate-dat')

module.exports = cb => {
  const dats = []
  db.createReadStream({
    gt: ['archive', null],
    lt: ['archive', undefined]
  })
  .on('data', data => {
    console.log('read', data)
    dats.push(activate(load(data.value)))
  })
  .on('error', err => cb(err))
  .on('end', () => cb(null, dats))
}
