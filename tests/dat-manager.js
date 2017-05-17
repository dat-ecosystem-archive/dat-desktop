var tape = require('tape')
var Multidat = require('multidat')
var toilet = require('toiletdb')
var fs = require('fs')

var Manager = require('../lib/dat-manager')

tape('dat-manager', function (t) {
  var multidat, dbPaused, manager

  t.test('setup', function (t) {
    dbPaused = toilet(`/tmp/${Math.random()}`)
    var db = toilet(`/tmp/${Math.random()}`)
    Multidat(db, function (err, m) {
      t.error(err)
      multidat = m
      t.end()
    })
  })

  t.test('Manager({ multidat, dbPaused, onupdate })', function (t) {
    t.test('assert arguments', function (t) {
      var onupdate = function () {}
      t.throws(Manager.bind(null))
      t.throws(Manager.bind(null, { multidat }))
      t.throws(Manager.bind(null, { multidat, dbPaused }))
      t.throws(Manager.bind(null, { multidat }, onupdate))
      manager = Manager({ multidat, dbPaused }, onupdate)
      t.ok(manager)
      t.end()
    })
  })

  t.test('.create(dir, opts, cb)', function (t) {
    t.test('assert arguments', function (t) {
      var dir = `/tmp/${Math.random()}`
      t.throws(manager.create.bind(manager))
      t.throws(manager.create.bind(manager, dir))
      t.throws(manager.create.bind(manager, dir, {}))
      manager.create(dir, {}, function () {})
      manager.create(dir, function () {})
      t.end()
    })
    t.test('create a dat', function (t) {
      function onupdate (err, dats) {
        t.error(err)
        var dat = dats[0]
        if (dat && dat.network && dat.metadata && dat.metadata.title && dat.stats && typeof dat.progress === 'number') {
          t.end()
        }
      }
      var manager = Manager({ multidat, dbPaused }, onupdate)
      var dir = `/tmp/${Math.random()}`
      manager.create(dir, function (err, dat) {
        t.error(err)
        t.ok(dat)
      })
    })
  })
  
  t.test('.close(key, cb)')
  t.test('.closeAll(cb)')
  t.test('.pause(dat, cb)')
  t.test('.resume(dat, cb)')
  t.test('.togglePause(dat, cb)')

  t.test('finish', function (t) {
    t.end()
    process.exit()
  })
})
