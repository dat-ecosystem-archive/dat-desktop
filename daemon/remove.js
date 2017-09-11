const argv = require('minimist')(process.argv.slice(2))
const key = argv._[0]
const config = require('../config')()
const net = require('net')

if (!key) {
  console.error('No key to remove.')
  process.exit(1)
}

const client = net.connect(config.socket, () => {
  client.write(`remove ${key}`)
})

client.on('data', (msg) => {
  console.log(msg.toString())
})
