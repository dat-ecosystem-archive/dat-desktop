const persist = require('choo-persist')
const mount = require('choo/mount')
const log = require('choo-log')
const xtend = require('xtend')
const choo = require('choo')
const css = require('sheetify')

css('./public/css/base.css', { global: true })

const opts = {
  filter: (state) => {
    state = xtend(state)
    delete state.app
    return state
  }
}

persist(opts, (p) => {
  const app = choo()
  app.use(log())
  app.use(p)

  app.model(require('./models/app')())

  app.router(['/', require('./pages/main')])
  mount('body', app.start())
})
