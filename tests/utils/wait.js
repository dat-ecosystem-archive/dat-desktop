// Returns a promise that resolves after 'ms' milliseconds. Default: 1 second
module.exports = function wait (ms) {
  ms = ms || 3000
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, ms)
  })
}
