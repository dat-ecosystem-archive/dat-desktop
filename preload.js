'use strict'
/**
 * This file exists for security reasons!
 *
 * It prepares by removing dangerous scripts from the global scopes
 * Before running the app.
 *
 * See: https://electronjs.org/docs/tutorial/security
 *    & https://eslint.org/docs/rules/no-implied-eval
 */
const platform = require('os').platform()
window.__defineGetter__('DAT_ENV', () => ({ platform }))

// eslint-disable-next-line no-eval
window.eval = global.eval = function () {
  throw new Error('Sorry, this app does not support window.eval().')
}
const setTimeout = global.setTimeout
window.setTimeout = global.setTimeout = function (fn, ms) {
  if (typeof fn !== 'function') {
    throw new Error('Sorry, this app does not support setTimeout() with a string')
  }
  return setTimeout(fn, ms)
}
const setInterval = global.setInterval
window.setInterval = global.setInterval = function (fn, ms) {
  if (typeof fn !== 'function') {
    throw new Error('Sorry, this app does not support setInterval() with a string')
  }
  return setInterval(fn, ms)
}
process.once('loaded', () => {
  document.addEventListener('DOMContentLoaded', () => require('./static/bundle'))
})
