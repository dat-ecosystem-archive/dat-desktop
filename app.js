const persist = require('choo-persist')
const mount = require('choo/mount')
const log = require('choo-log')
const css = require('sheetify')
const xtend = require('xtend')
const choo = require('choo')

const params = require('./lib/param-router')

css('dat-colors')
css('tachyons')
css('./public/css/base.css')
css('./public/css/colors.css')

const opts = {
  filter: (state) => {
    state = xtend(state)
    delete state.repos
    return state
  }
}

persist(opts, (p) => {
  const app = choo()
  app.use(p)

  if (process.env.NODE_ENV === 'development') {
    app.use(log())
  }

  app.model(require('./models/main-view')())
  app.model(require('./models/window')())
  app.model(require('./models/repos')())
  app.model(require('./models/error')())

  app.router([
    ['/', params({
      default: require('./pages/main'),
      error: require('./pages/main-error'),
      share: require('./pages/main-share'),
      delete: require('./pages/main-delete')
    })]
  ])

  mount('body', app.start())
})
