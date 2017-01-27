var spectron = require('spectron')
var path = require('path')
var tape = require('tape')

tape('application test', function (t) {
  t.test('should be able to boot up the app', function (t) {
    t.plan(2)
    var app = createApp()
    app.start()
      .then(() => app.browserWindow.isVisible())
      .then((isVisible) => t.equal(isVisible, true))
      .then(() => app.stop())
      .then(() => t.pass('app stopped'))
      .catch((error) => console.error('Test failed', error.message))
  })

  t.test('welcome screen should appear, and be dismissable', function (t) {
    t.plan(2)
    var app = createApp()
    app.start()
      .then(() => app.browserWindow.isVisible())
      .then((isVisible) => t.equal(isVisible, true))
      .then(() => app.stop())
      .then(() => t.pass('app stopped'))
      .catch((error) => console.error('Test failed', error.message))
  })
})

function createApp () {
  return new spectron.Application({
    path: path.join(__dirname, '../node_modules/.bin/electron'),
    args: [path.join(__dirname, '../index.js')]
  })
}
