const net = require('net')
const client = net.connect('../dats.sock', () => {
  client.write('list')
})

client.on('data', (msg) => {
  console.log(msg.toString())
})
