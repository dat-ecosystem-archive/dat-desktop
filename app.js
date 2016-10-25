const bulk = require('bulk-require')
const mount = require('choo/mount')
const log = require('choo-log')
const choo = require('choo')

require('./_app')

// // init
// const opts = {}
// const app = choo()
// app.router(['/', mainView])

// // logic
// const logic = bulk(__dirname, [ 'models/*' ])
// Object.keys(logic).forEach((key) => {
//   Object.keys(logic[key]).forEach((key) => {
//     app.model(logic.actions[key](opts))
//   })
// })

// // start
// app.use(log())
// mount('body', app.start({ href: false }))
