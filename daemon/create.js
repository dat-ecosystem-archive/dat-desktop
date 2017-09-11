const argv = require('minimist')(process.argv.slice(2))
const directory = argv._[0]
const config = require('../config')()
const net = require('net')

if (!directory) {
  console.error('No directory to share.')
  process.exit(1)
}

const client = net.connect(config.socket, () => {
  client.write(`create ${directory}`)
})

client.on('data', (msg) => {
  console.log(msg.toString())
})
