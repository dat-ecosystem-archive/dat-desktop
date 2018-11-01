#!/usr/bin/env node
var clipboard = require('clipboardy')
var spectron = require('spectron')
var path = require('path')
var test = require('tape').test
var del = require('del')
var { exec } = require('child_process')
var props = require('bluebird').props
var waitForAndClick = require('./utils/waitForAndClick')
var waitForMatch = require('./utils/waitForMatch')
var wait = require('./utils/wait')

var TEST_DATA = path.join(__dirname, 'test_data')
var TEST_DATA_DB = path.join(TEST_DATA, 'multidat.json')
var FIXTURES = path.join(__dirname, 'fixtures')

test('init', function (t) {
  t.test('should be able to boot up the app', function (t) {
    const app = createApp()
    return init(app, t)
      .then(() =>
        props({
          getWindowCount: app.client.getWindowCount(),
          isMinimized: app.browserWindow.isMinimized(),
          isDevToolsOpened: app.browserWindow.isDevToolsOpened(),
          isFocused: app.browserWindow.isFocused(),
          bounds: app.browserWindow
            .getBounds()
            .then(bounds => ({ width: bounds.width, height: bounds.height }))
        })
      )
      .then(props =>
        t.deepEquals(
          props,
          {
            getWindowCount: 1,
            isMinimized: false,
            isDevToolsOpened: false,
            isFocused: true,
            bounds: {
              width: 800,
              height: 600
            }
          },
          'All settings match'
        )
      )
      .catch(e => t.fail(e))
      .then(() => endTest(app, t))
  })
  t.end()
})

test('onboarding', function (t) {
  t.test(
    'intro should show every time you open the app as long as you have no dats',
    function (t) {
      var app = createApp()
      return initAndSkipIntro(app, t)
        .then(() => app.stop())
        .then(() => Promise.resolve((app = createApp())))
        .then(() => waitForLoad(app, t))
        .then(() =>
          app.browserWindow
            .isVisible()
            .then(isVisible => t.ok(isVisible, 'App is visible.'))
        )
        .then(() => waitForAndClick(t, app, '.btn-get-started'))
        .then(() => app.client.waitForExist('.btn-skip'))
        .catch(e => t.fail(e))
        .then(() => endTest(app, t))
    }
  )
  t.end()
})

function initAndSkipIntro (app, t) {
  return init(app, t)
    .then(() =>
      app.browserWindow
        .getTitle()
        .then(title =>
          t.equals(
            title,
            'Dat Desktop | Welcome',
            'intro title shown in the beginning'
          )
        )
    )
    .then(() => waitForAndClick(t, app, '.btn-get-started'))
    .then(() => waitForAndClick(t, app, '.btn-skip'))
    .then(() =>
      app.browserWindow
        .getTitle()
        .then(title =>
          t.equals(title, 'Dat Desktop', 'dat title shown after the intro')
        )
    )
}

test('working with dats', function (t) {
  var app = createApp()
  return initAndSkipIntro(app, t)
    .then(() => waitForAndClick(t, app, '.btn-share-folder'))
    .then(() =>
      Promise.all([
        waitForMatch(t, app, '.network', /0/),
        waitForMatch(t, app, '.size', /(126|52) B/, 'contains correct size')
      ])
    )
    .then(() =>
      Promise.all([
        clipboard.write('').then(() => t.ok(true, 'Cleared clipboard')),
        waitForAndClick(t, app, '.btn-link')
      ])
    )
    .then(() => waitForAndClick(t, app, '.btn-copy-to-clipboard'))
    .then(() => wait(200))
    .then(() =>
      clipboard
        .read()
        .then(text =>
          t.ok(
            text.match(/^dat:\/\/[0-9a-f]{32}/),
            'link copied to clipboard: ' + text
          )
        )
    )
    .then(() => app.stop())
    .then(() => Promise.resolve((app = createApp())))
    .then(() => waitForLoad(app, t))
    .then(() =>
      app.browserWindow
        .isVisible()
        .then(isVisible => t.equal(isVisible, true, 'reloaded and is visible'))
    )
    .then(() =>
      waitForMatch(t, app, '.size', /(126|52) B/, 'contains correct size')
    )
    .then(() => waitForAndClick(t, app, '.btn-delete'))
    .then(() => waitForAndClick(t, app, '.btn-cancel'))
    .then(() => waitForAndClick(t, app, '.btn-delete'))
    .then(() => waitForAndClick(t, app, '.btn-confirm'))
    .then(() =>
      waitForMatch(
        t,
        app,
        '.tutorial',
        /share/i,
        'now the dat is gone and welcome screen is back'
      )
    ) // now the dat is gone and welcome screen is back
    .catch(e => t.fail(e))
    .then(() => endTest(app, t))
})

// Create a new app instance
function createApp (t) {
  var app = new spectron.Application({
    path: path.join(__dirname, '../node_modules/.bin/electron'),
    args: [
      path.join(__dirname, '../index.js'),
      '--data',
      TEST_DATA,
      '--db',
      TEST_DATA_DB
    ],
    env: {
      NODE_ENV: 'test',
      RUNNING_IN_SPECTRON: true,
      OPEN_RESULT: FIXTURES
    }
  })
  process.on('SIGTERM', () => endTest(app))
  return app
}

function clear () {
  return Promise.all([
    new Promise((resolve, reject) =>
      exec(
        `git checkout -- "${FIXTURES}"`,
        error => (error ? reject(error) : resolve())
      )
    ),
    del(FIXTURES),
    del(TEST_DATA)
  ])
}

function init (app, t) {
  return clear().then(() => waitForLoad(app, t))
}

// Starts the app, waits for it to load, returns a promise
function waitForLoad (app, t) {
  return app
    .start()
    .then(() => app.client.waitUntilWindowLoaded())
    .then(function () {
      // Switch to the main window
      return app.client.windowByIndex(0)
    })
    .then(() => app.client.waitUntilWindowLoaded())
    .then(() =>
      app.browserWindow
        .isVisible()
        .then(isVisible => t.ok(isVisible, 'isVisible'))
    )
    .then(() => app)
}

// Quit the app, end the test, either in success (!err) or failure (err)
function endTest (app, t) {
  return app
    .stop()
    .then(() => clear())
    .then(() => t && t.end())
}
