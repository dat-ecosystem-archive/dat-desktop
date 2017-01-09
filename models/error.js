module.exports = model

function model () {
  return {
    subscriptions: {
      onUncaughtException: onUncaughtException
    }
  }
}

function onUncaughtException (send, done) {
  process.on('uncaughtException', function (err) {
    console.error(err)
  })
}

// setTimeout(function () {
//   throw new Error('whathca derp')
// }, 2000)
