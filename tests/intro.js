#!/usr/bin/env node
var EventEmitter = require('events').EventEmitter
var tape = require('tape')
var spok = require('spok')

var intro = require('../models/intro')

tape('models/intro: should initialize with a default state', function (t) {
  var state = {}
  var emitter = new EventEmitter()
  intro(state, emitter)
  spok(t, state, {
    intro: {
      show: false
    }
  })
  t.end()
})

tape('should show intro screen if there are no dats', function (t) {
  var state = {
    dats: {
      values: []
    },
    intro: {
      show: true
    }
  }
  var emitter = new EventEmitter()
  intro(state, emitter)
  emitter.emit('dats:loaded')
  spok(t, state, {
    intro: {
      show: true
    }
  })
  t.end()
})

tape('should be able to hide the intro screen', function (t) {
  var state = {
    intro: {
      show: true
    }
  }
  var emitter = new EventEmitter()
  intro(state, emitter)
  emitter.emit('intro:hide')
  spok(t, state, {
    intro: {
      show: false
    }
  })
  t.end()
})
