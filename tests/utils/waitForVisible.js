module.exports = function waitForVisible (t, app, selector, ms, reverse) {
  return app.client.waitForVisible(selector, ms, reverse).then(() => {
    t.ok(true, selector + ' exists.')
    return selector
  })
}
