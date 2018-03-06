import test from 'tape'
import React from 'react'
import { shallow } from 'enzyme'
import DatImport from '../app/components/dat-import'
import Icon from '../app/components/icon'

test('dat import should render input element and icon', t => {
  const wrapper = shallow(<DatImport onAddDat={() => {}} />)

  t.equal(wrapper.find('input').length, 1)
  t.equal(wrapper.find(Icon).length, 1)

  t.end()
})
