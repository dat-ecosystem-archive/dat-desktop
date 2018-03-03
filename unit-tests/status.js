import test from 'tape'
import React from 'react'
import configure from 'enzyme-adapter-react-helper'
import { shallow } from 'enzyme'
import Status from '../app/components/status'

configure()

test('progress text should read "Paused" when dat is paused', t => {
  const wrapper = shallow(
    <Status
      dat={{
        state: 'loading',
        stats: {
          network: {
            up: 30,
            down: 40
          }
        },
        paused: true
      }}
    />
  )

  t.equal(
    wrapper
      .find('.f7.f6-l')
      .children()
      .children()
      .text(),
    'Paused.'
  )

  t.end()
})

test('progress text should show upload speed  when dat is completed', t => {
  const wrapper = shallow(
    <Status
      dat={{
        state: 'complete',
        stats: {
          network: {
            up: 30,
            down: 40
          }
        },
        paused: false
      }}
    />
  )

  t.equal(
    wrapper
      .find('.f7.f6-l')
      .children()
      .children()
      .text(),
    'Complete. ↑ 30 B/s'
  )

  t.end()
})

test('progress text should show wait message when dat is stale', t => {
  const wrapper = shallow(
    <Status
      dat={{
        state: 'stale',
        stats: {
          network: {
            up: 30,
            down: 40
          }
        },
        paused: false
      }}
    />
  )

  t.equal(
    wrapper
      .find('.f7.f6-l')
      .children()
      .children()
      .text(),
    'waiting for peers…'
  )

  t.end()
})

test('progress text should show up/down speed when dat is loading', t => {
  const wrapper = shallow(
    <Status
      dat={{
        state: 'loading',
        stats: {
          network: {
            up: 30,
            down: 40
          }
        },
        paused: false
      }}
    />
  )

  t.equal(
    wrapper
      .find('.f7.f6-l')
      .children()
      .children()
      .text(),
    '↓  40 B/s↑  30 B/s'
  )

  t.end()
})
