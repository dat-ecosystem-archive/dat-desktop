#!/usr/bin/env node
var EventEmitter = require('events').EventEmitter
var test = require('tap').test
var spok = require('spok')

var intro = require('../models/intro')

test('models/intro: should initialize with a default state', function (t) {
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

test('should show intro screen if there are no dats', function (t) {
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

test('should be able to hide the intro screen', function (t) {
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
