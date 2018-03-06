import test from 'tape'
import React from 'react'
import configure from 'enzyme-adapter-react-helper'
import { shallow } from 'enzyme'
import Inspect from '../app/components/inspect'

configure()

test('should render an empty div component', t => {
  const wrapper = shallow(
    <Inspect dat={null} closeInspectDat={() => {}} addFilesToDat={() => {}} />
  )

  t.equal(wrapper.find('div').length, 1)

  t.end()
})

test('should set title to dat key when metadata is not present on dat', t => {
  const key = '40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755196cdeb80bd3f8'
  const wrapper = shallow(
    <Inspect
      dat={{
        key,
        stats: {
          length: 20
        }
      }}
      closeInspectDat={() => {}}
      addFilesToDat={() => {}}
    />
  )

  t.equal(wrapper.find('h2').text(), key)

  t.end()
})

test('should show default values when metadata is not present on dat ', t => {
  const defaultAuthor = 'N/A'
  const defaultDescription = 'N/A'
  const defaultSize = '0'

  const key = '40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755196cdeb80bd3f8'
  const wrapper = shallow(
    <Inspect
      dat={{
        key,
        stats: {
          length: 'woot'
        },
        peers: 2
      }}
      closeInspectDat={() => {}}
      addFilesToDat={() => {}}
    />
  )

  const selectableNodes = wrapper.find('.is-selectable')

  t.equal(selectableNodes.at(1).text(), defaultSize)
  t.equal(selectableNodes.at(3).text(), defaultAuthor)
  t.equal(selectableNodes.at(4).text(), defaultDescription)

  t.end()
})

test('should show info when present on dat', t => {
  const key = '40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755196cdeb80bd3f8'
  const wrapper = shallow(
    <Inspect
      dat={{
        key,
        stats: {
          length: 9
        },
        peers: 2,
        metadata: {
          author: 'A-author',
          description: 'A-desc'
        },
        path: 'A-path'
      }}
      closeInspectDat={() => {}}
      addFilesToDat={() => {}}
    />
  )

  const selectableNodes = wrapper.find('.is-selectable')

  t.equal(selectableNodes.at(0).text(), key)
  t.equal(selectableNodes.at(1).text(), '9 B')
  t.equal(selectableNodes.at(2).text(), '2')
  t.equal(selectableNodes.at(3).text(), 'A-author')
  t.equal(selectableNodes.at(4).text(), 'A-desc')
  t.equal(selectableNodes.at(5).text(), 'A-path')

  t.end()
})
