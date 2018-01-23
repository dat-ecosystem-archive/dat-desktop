var clipboard = require('clipboardy')
var spectron = require('spectron')
var path = require('path')
var tap = require('tap').test
var del = require('del')
var { execSync } = require('child_process')

var TEST_DATA = path.join(__dirname, 'test_data')
var TEST_DATA_DB = path.join(TEST_DATA, 'multidat.json')

tap('init', function (t) {
  t.test('should be able to boot up the app', function (t) {
    var app = createApp()
    return waitForLoad(app)
      .then(() => app.browserWindow.isVisible())
      .then((val) => t.ok(val, 'isVisible'))
      .then(() => app.client.getWindowCount())
      .then((val) => t.equal(val, 1, 'getWindowCount'))
      .then(() => app.browserWindow.isMinimized())
      .then((val) => t.equal(val, false, 'isMinimized'))
      .then(() => app.browserWindow.isDevToolsOpened())
      .then((val) => t.equal(val, false, 'isDevToolsOpened'))
      .then(() => app.browserWindow.isVisible())
      .then((val) => t.equal(val, true, 'isVisible'))
      .then(() => app.browserWindow.isFocused())
      .then((val) => t.equal(val, true, 'isFocused'))
      .then(() => app.browserWindow.getBounds())
      .then((val) => t.notEqual(val.width, 0, 'getBounds'))
      .then(() => app.browserWindow.getBounds())
      .then((val) => t.notEqual(val.height, 0, 'getBounds'))
      .catch(e => t.fail(e))
      .then(() => endTest(app))
  })
  t.end()
})

tap('onboarding', function (t) {
  t.test('intro should show every time you open the app as long as you have no dats', function (t) {
    var app = createApp()
    return waitForLoad(app)
      .then(() => app.browserWindow.isVisible())
      .then((isVisible) => t.ok(isVisible, 'isVisible'))
      .then(() => app.browserWindow.getTitle())
      .then((title) => t.equal(title, 'Dat Desktop | Welcome', 'correct title'))
      .then(() => app.client.click('button'))
      .then(() => wait())
      .then(() => app.client.click('button[title="Skip Intro"]'))
      .then(() => wait())
      .then(() => app.browserWindow.getTitle())
      .then((title) => t.equal(title, 'Dat Desktop', 'correct title'))
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
  var app = createApp({
    openDialogResult: path.join(__dirname, 'fixtures')
  })
  return waitForLoad(app)
    .then(() => app.browserWindow.isVisible())
    .then((isVisible) => t.ok(isVisible, 'isVisible'))
    .then(() => app.client.click('button'))
    .then(() => wait(4000))
    .then(() => app.client.click('button[title="Skip Intro"]'))
    .then(() => wait())
    .then(() => app.client.click('button[title="Share Folder"]')) // create new
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
    .then(() => clipboard.read())
    .then(text => t.ok(text.match(/^dat:\/\/[0-9a-f]{32}/), 'link copied to clipboard'))
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
    .then(() => wait())
    .then(() => app.client.click('button.delete'))
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
function createApp (opts) {
  opts = opts || {}
  var app = new spectron.Application({
    path: path.join(__dirname, '../node_modules/.bin/electron'),
    args: [path.join(__dirname, '../index.js'), '--data', TEST_DATA, '--db', TEST_DATA_DB],
    env: { NODE_ENV: 'test', RUNNING_IN_SPECTRON: true, TEST_OPEN_DIALOG_RESULT: opts.openDialogResult }
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

// Returns a promise that resolves after 'ms' milliseconds. Default: 1 second
function wait (ms) {
  ms = ms || 3000
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, ms)
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
