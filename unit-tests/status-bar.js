import test from 'tape'
import React from 'react'
import configure from 'enzyme-adapter-react-helper'
import { shallow } from 'enzyme'
import StatusBar from '../app/components/status-bar'

configure()

test('status bar should render a fragment with single child (div) when show is false', t => {
  const wrapper = shallow(<StatusBar up={20} down={40} show={false} />)

  t.equal(wrapper.find('div').length, 1)

  t.end()
})

test('status bar should render a Bar with two childrens when show is true', t => {
  const show = true
  const wrapper = shallow(<StatusBar up={20} down={40} show={show} />)

  t.equal(wrapper.find('span').length, 2)

  t.end()
})
