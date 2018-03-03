import test from 'tape'
import React from 'react'
import configure from 'enzyme-adapter-react-helper'
import { shallow } from 'enzyme'
import HexContent from '../app/components/hex-content'

configure()

test('hexagon should be blue when loading dat', t => {
  const wrapper = shallow(
    <HexContent
      dat={{
        state: 'loading',
        paused: true
      }}
    />
  )

  t.equal(wrapper.find('.color-blue.hover-color-blue-hover').length, 2)

  t.end()
})

test('hexagon should be neutral colored when dat is paused', t => {
  const wrapper = shallow(
    <HexContent
      dat={{
        state: 'woot',
        paused: true
      }}
    />
  )

  t.equal(wrapper.find('.color-neutral-30.hover-color-neutral-40').length, 2)

  t.end()
})

test('hexagon should be green colored when dat is completed', t => {
  const wrapper = shallow(
    <HexContent
      dat={{
        state: 'complete',
        paused: false
      }}
    />
  )

  t.equal(wrapper.find('.color-green.hover-color-green-hover').length, 1)

  t.end()
})

test('hexagon should be neutral colored when dat is resumed but neighter loading nor completed', t => {
  const wrapper = shallow(
    <HexContent
      dat={{
        state: '',
        paused: false
      }}
    />
  )

  t.equal(wrapper.find('.color-neutral-30.hover-color-neutral-40').length, 1)

  t.end()
})
