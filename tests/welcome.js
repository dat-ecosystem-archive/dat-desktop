var EventEmitter = require('events').EventEmitter
var tape = require('tape')
var spok = require('spok')

var welcome = require('../models/welcome')

tape('models/welcome: should initialize with a default state', function (t) {
  var state = {}
  var emitter = new EventEmitter()
  welcome(state, emitter)
  spok(t, state, {
    welcome: {
      show: false
    }
  })
  t.end()
})

tape('should show welcome screen if there are no dats', function (t) {
  var state = {
    dats: {
      values: []
    },
    welcome: {
      show: true
    }
  }
  var emitter = new EventEmitter()
  welcome(state, emitter)
  emitter.emit('dats:loaded')
  spok(t, state, {
    welcome: {
      show: true
    }
  })
  t.end()
})

tape('should be able to hide the welcome screen', function (t) {
  var state = {
    welcome: {
      show: true
    }
  }
  var emitter = new EventEmitter()
  welcome(state, emitter)
  emitter.emit('welcome:hide')
  spok(t, state, {
    welcome: {
      show: false
    }
  })
  t.end()
})
