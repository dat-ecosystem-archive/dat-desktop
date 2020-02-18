var wait = require('./wait')

module.exports = function waitForMatch (t, app, selector, regexp, ms, reverse) {
  if (reverse) {
    reverse = true
  } else {
    reverse = false
  }
  if (!ms) {
    ms = 15000
  }
  var lastValue
  var end = Date.now() + ms
  function check () {
    if (Date.now() > end) {
      return Promise.reject(
        new Error(
          `Timeout after ${ms}ms tryin to match "${selector}" with ${String(
            regexp
          )}; last value: ${lastValue}`
        )
      )
    }
    return app.client
      .getText(selector)
      .then(function (text) {
        lastValue = text
        var match = regexp.test(text) ? !reverse : reverse
        if (!match) {
          return Promise.reject(new Error('no-match'))
        }
        t.ok(true, '"' + selector + '" matches ' + String(regexp))
        return Promise.resolve(text)
      })
      .catch(function (e) {
        return wait(100).then(check)
      })
  }
  return check()
}
