import test from 'tape'
import React from 'react'
import { shallow } from 'enzyme'
import Table from '../app/components/table'
import TableRowContainer from '../app/containers/table-row'

test('table should render columns (Link, Status, Size, Peers)', t => {
  const show = true
  const wrapper = shallow(<Table dats={[{}]} show={show} />)

  const columns = wrapper.find('.tl').map(node => node.text().toLowerCase())

  t.deepLooseEqual(columns.sort(), ['link', 'status', 'size', 'peers'].sort())

  t.end()
})

test('table should render same number of table rows as given dats', t => {
  const show = true
  const wrapper = shallow(<Table dats={[{}, {}, {}]} show={show} />)

  t.equal(wrapper.find(TableRowContainer).length, 3)

  t.end()
})
