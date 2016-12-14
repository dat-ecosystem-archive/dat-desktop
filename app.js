const persist = require('choo-persist')
const mount = require('choo/mount')
const log = require('choo-log')
const xtend = require('xtend')
const choo = require('choo')
const css = require('sheetify')
const fs = require('fs')

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

  app.router(['/', require('./pages/main')])
  mount('body', app.start())
})

window.ondragover = (e) => e.preventDefault()
window.ondrop = (e) => {
  e.preventDefault()
  const folder = e.dataTransfer &&
    e.dataTransfer.files &&
    e.dataTransfer.files[0] &&
    e.dataTransfer.files[0].path
  if (!folder) return
  fs.stat(folder, (err, stat) => {
    if (err) throw err
    if (!stat.isDirectory()) return
    console.log({ folder })
  })
}
