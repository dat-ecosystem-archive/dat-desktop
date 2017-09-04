const persist = require('choo-persist')
const expose = require('choo-expose')
const log = require('choo-log')
const css = require('sheetify')
const choo = require('choo')
const xtend = Object.assign
const remoteProcess = require('electron').remote.process
const remoteApp = require('electron').remote.app
const minimist = require('minimist')
const path = require('path')

const argv = minimist(remoteProcess.argv.slice(2))
const downloadsDir = (argv.data)
  ? argv.data
  : path.join(remoteApp.getPath('downloads'), '/dat')

require('./lib/monkeypatch')

css('dat-colors')
css('tachyons')
css('./assets/base.css')

const app = choo()

app.use(persist({
  filter: function (state) {
    return xtend({}, state, { dats: {} })
  }
}))

if (process.env.NODE_ENV === 'development') {
  app.use(log())
  app.use(expose())
}

app.use(require('./models/intro'))
app.use(require('./models/inspect'))
app.use(require('./models/download'))
app.use(require('./models/drag-drop'))
app.use(require('./models/dats')({dbLocation: argv.db, downloadsDir: downloadsDir}))
app.use(require('./models/desktop'))
app.use(require('./models/error'))

app.route('/', require('./pages/main'))

app.mount('body div')
