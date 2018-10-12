const waitForVisible = require('./waitForVisible')

module.exports = function waitForAndClick (t, app, selector, ms, reverse) {
  return waitForVisible(t, app, selector, ms, reverse)
    .then(selector => {
      return app.client.click(selector)
    })
    .then(() => t.ok(true, selector + ' clicked.'))
}
