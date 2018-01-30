module.exports = function waitForAndClick (t, app, selector, ms, reverse) {
  return app.client.waitForExist(selector, ms, reverse)
    .then(function () {
      t.ok(true, selector + ' exists.')
      return app.client.click(selector)
        .then(function () {
          t.ok(true, selector + ' clicked.')
        })
    })
}
