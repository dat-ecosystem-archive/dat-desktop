const persist = require('choo-persist')
const log = require('choo-log')
const css = require('sheetify')
const choo = require('choo')
const xtend = Object.assign

css('dat-colors')
css('tachyons')
css('./public/css/base.css')
css('./public/css/colors.css')

const app = choo()

app.use(persist({
  filter: function (state) {
    return xtend({}, state, { repos: {} })
  }
}))

if (process.env.NODE_ENV === 'development') {
  app.use(log())
}

app.use(require('./models/welcome'))
app.use(require('./models/window'))
app.use(require('./models/repos'))
app.use(require('./models/error'))

app.route('/', require('./pages/main'))

app.mount('body div')

