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
    delete state.repos
    return state
  }
}

persist(opts, (p) => {
  const app = choo()
  app.use(log())
  app.use(p)

  app.model(require('./models/main-view')())
  app.model(require('./models/repos')())
  app.model(require('./models/window')())
  app.model(require('./models/error')())

  app.router(['/', require('./pages/main')])
  mount('body', app.start())
})
