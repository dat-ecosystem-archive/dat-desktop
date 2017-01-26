var spectron = require('spectron')
var path = require('path')
var tape = require('tape')

tape('application test', function (t) {
  t.test('should run the thing', function (t) {
    var app = new spectron.Application({
      path: path.join(__dirname, '../node_modules/.bin/electron'),
      args: [path.join(__dirname, '../index.js')]
    })
    app.start().then(function () {
      return app.browserWindow.isVisible()
    }).then(function (isVisible) {
      t.equal(isVisible, true)
    }).then(function () {
      return app.client.getTitle()
    }).then(function (title) {
      t.equal(title, 'Dat Desktop')
    }).then(function () {
      return app.stop()
    }).catch(function (error) {
      console.error('Test failed', error.message)
    })
  })
})
