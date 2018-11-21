import test from 'tape'
import React from 'react'
import { shallow } from 'enzyme'
import Inspect from '../app/components/inspect'

test('should render empty', t => {
  const wrapper = shallow(<Inspect dat={null} closeInspectDat={() => {}} />)

  t.equal(wrapper.isEmptyRender(), true)

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
    />
  )

  t.equal(wrapper.find('h2').text(), key)

  t.end()
})

test('should show default values when metadata is not present on dat ', t => {
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
    />
  )

  t.equal(wrapper.children().find('[data-test="key"]').childAt(0).text(), key)
  t.equal(wrapper.children().find('[data-test="size"]').childAt(0).text(), '0 B')
  t.equal(wrapper.children().find('[data-test="author"]').childAt(0).text(), 'N/A')
  t.equal(wrapper.children().find('[data-test="description"]').childAt(0).text(), 'N/A')

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
    />
  )

  t.equal(wrapper.children().find('[data-test="key"]').childAt(0).text(), key)
  t.equal(wrapper.children().find('[data-test="size"]').childAt(0).text(), '9 B')
  t.equal(wrapper.children().find('[data-test="peers"]').childAt(0).text(), '2')
  t.equal(wrapper.children().find('[data-test="author"]').childAt(0).text(), 'A-author')
  t.equal(wrapper.children().find('[data-test="description"]').childAt(0).text(), 'A-desc')
  t.equal(wrapper.children().find('[data-test="path"]').childAt(0).text(), 'A-path')

  t.end()
})
