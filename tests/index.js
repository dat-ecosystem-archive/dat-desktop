#!/usr/bin/env node
var clipboard = require('clipboardy')
var spectron = require('spectron')
var path = require('path')
var tap = require('tap').test
var del = require('del')
var { execSync } = require('child_process')
var wait = require('./utils/wait')
var waitForAndClick = require('./utils/waitForAndClick')

var TEST_DATA = path.join(__dirname, 'test_data')
var TEST_DATA_DB = path.join(TEST_DATA, 'multidat.json')

tap('init', function (t) {
  t.test('should be able to boot up the app', function (t) {
    var app = createApp()
    return waitForLoad(app)
      .then(() => Promise.all([
        t.resolveMatch(app.browserWindow.isVisible(), true, 'isVisible'),
        t.resolveMatch(app.client.getWindowCount(), 1, 'getWindowCount'),
        t.resolveMatch(app.browserWindow.isMinimized(), false, 'isMinimized'),
        t.resolveMatch(app.browserWindow.isDevToolsOpened(), false, 'isDevToolsOpened'),
        t.resolveMatch(app.browserWindow.isVisible(), true, 'isVisible'),
        t.resolveMatch(app.browserWindow.isFocused(), true, 'isFocused'),
        t.resolveMatch(app.browserWindow.getBounds().then(bounds => bounds.width !== 0), true, 'getBounds'),
        t.resolveMatch(app.browserWindow.getBounds().then(bounds => bounds.height !== 0), true, 'getBounds')
      ]))
      .catch(e => t.fail(e))
      .then(() => endTest(app))
  })
  t.end()
})

tap('onboarding', function (t) {
  t.test('intro should show every time you open the app as long as you have no dats', function (t) {
    var app = createApp()
    return waitForLoad(app)
      .then(() => t.resolveMatch(app.browserWindow.isVisible(), true, 'isVisible'))
      .then(() => t.resolveMatch(app.browserWindow.getTitle(), 'Dat Desktop | Welcome', 'correct title'))
      .then(() => app.client.click('button'))
      .then(() => wait())
      .then(() => waitForAndClick(t, app, 'button[title="Skip Intro"]'))
      .then(() => t.resolveMatch(app.browserWindow.getTitle(), 'Dat Desktop', 'correct title'))
      .then(() => app.stop())
      .then(() => Promise.resolve(app = createApp()))
      .then(() => waitForLoad(app))
      .then(() => app.browserWindow.isVisible())
      .then(() => app.client.click('button'))
      .then(() => wait())
      .then(() => app.client.getText('button[title="Skip Intro"]'))
      .catch(e => t.fail(e))
      .then(() => endTest(app))
  })
  t.end()
})

tap('working with dats', function (t) {
  var app = createApp()
  return waitForLoad(app)
    .then(() => t.resolveMatch(app.browserWindow.isVisible(), true, 'isVisible'))
    .then(() => waitForAndClick(t, app, 'button[title="Get Started"]'))
    .then(() => waitForAndClick(t, app, 'button[title="Skip Intro"]'))
    .then(() => waitForAndClick(t, app, 'button'))
    .then(() => wait())
    .then(() => app.client.getText('.size'))
    .then((text) => {
      t.ok(text.match(/(126|52) B/), 'contains correct size')
    })
    .then(() => app.client.getText('.network'))
    .then((text) => t.ok(text.match(/0/), 'contains network size'))
    .then(() => clipboard.write(''))
    .then(() => app.client.click('button[title="Share Dat"]'))
    .then(() => app.client.click('button[title="Copy to Clipboard"]'))
    .then(() => wait())
    .then(() => t.resolveMatch(clipboard.read(), /^dat:\/\/[0-9a-f]{32}/, 'link copied to clipboard'))
    .then(() => app.stop())
    .then(() => Promise.resolve(app = createApp()))
    .then(() => waitForLoad(app))
    .then(() => app.browserWindow.isVisible())
    .then((isVisible) => t.equal(isVisible, true, 'reloaded and is visible'))
    .then(() => wait())
    .then(() => app.client.getText('.size'))
    .then((text) => {
      t.ok(text.match(/(126|52) B/), 'contains correct size')
    })
    .then(() => waitForAndClick(t, app, 'button.delete'))
    .then(() => app.client.click('button.cancel-button'))
    .then(() => app.client.click('button.delete'))
    .then(() => app.client.click('button.confirm-button'))
    .then(() => wait())
    .then(() => app.client.getText('.tutorial'))
    .then((text) => t.ok(text.toLowerCase().match(/share/), 'now the dat is gone and welcome screen is back'))
    .catch(e => t.fail(e))
    .then(() => endTest(app))
})

// Create a new app instance
function createApp () {
  var app = new spectron.Application({
    path: path.join(__dirname, '../node_modules/.bin/electron'),
    args: [path.join(__dirname, '../index.js'), '--data', TEST_DATA, '--db', TEST_DATA_DB],
    env: { NODE_ENV: 'test', RUNNING_IN_SPECTRON: true }
  })
  process.on('SIGTERM', () => endTest(app))
  return app
}

// Starts the app, waits for it to load, returns a promise
function waitForLoad (app, t) {
  return app.start().then(function () {
    return app.client.waitUntilWindowLoaded()
  }).then(function () {
    // Switch to the main window
    return app.client.windowByIndex(0)
  }).then(function () {
    return app.client.waitUntilWindowLoaded()
  })
}

// Quit the app, end the test, either in success (!err) or failure (err)
function endTest (app) {
  var fixPath = path.join(__dirname, 'fixtures')
  return Promise.all([
    del(fixPath),
    del(TEST_DATA)
  ])
    .then(() => {
      execSync(`git checkout -- "${fixPath}"`)
      return app.stop()
    })
}
