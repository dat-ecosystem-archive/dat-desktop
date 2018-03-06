import test from 'tape'
import React from 'react'
import { shallow } from 'enzyme'
import Intro from '../app/components/intro'
import {
  Green as GreenButton,
  Plain as PlainButton
} from '../app/components/button'

test('intro screen should render only empty div when show is false', t => {
  const wrapper = shallow(<Intro show={false} />)

  t.equal(wrapper.find('div').length, 1)

  t.end()
})

test('intro screen should render only one <p> element when screen given', t => {
  const fn = () => {}
  const show = true
  const wrapper = shallow(
    <Intro show={show} screen={3} hide={fn} next={fn} openHomepage={fn} />
  )

  t.equal(wrapper.find('p').length, 1)

  t.end()
})

test('intro screen should not render plain button when screen is 1', t => {
  const fn = () => {}
  const show = true
  const wrapper = shallow(
    <Intro show={show} screen={1} hide={fn} next={fn} openHomepage={fn} />
  )

  t.equal(wrapper.find(PlainButton).length, 0)

  t.end()
})

test('intro screen should render plain button when screen is not 1', t => {
  const fn = () => {}
  const show = true
  const wrapper = shallow(
    <Intro show={show} screen={3} hide={fn} next={fn} openHomepage={fn} />
  )

  t.equal(wrapper.find(PlainButton).length, 1)

  t.end()
})

test('intro screen should render Done button when screen is not less than 5', t => {
  const fn = () => {}
  const show = true
  const wrapper = shallow(
    <Intro show={show} screen={5} hide={fn} next={fn} openHomepage={fn} />
  )

  t.equal(
    wrapper
      .find(GreenButton)
      .children()
      .text(),
    'Done'
  )

  t.end()
})

test('intro screen should render Next button when screen is less than 5', t => {
  const fn = () => {}
  const show = true
  const wrapper = shallow(
    <Intro show={show} screen={4} hide={fn} next={fn} openHomepage={fn} />
  )

  t.equal(
    wrapper
      .find(GreenButton)
      .children()
      .text(),
    'Next'
  )

  t.end()
})
