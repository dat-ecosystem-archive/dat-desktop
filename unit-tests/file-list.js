import test from 'tape'
import React from 'react'
import { shallow, render } from 'enzyme'
import FileList from '../app/components/file-list'

test('file list should render div with class pa2', t => {
  const files = []
  const wrapper = shallow(
    <FileList
      dat={{
        files
      }}
    />
  )

  t.equal(wrapper.find('.pa2').length, 0)

  t.end()
})

test('file list should render tr(s) equal to number of files in dat', t => {
  const files = [
    {
      path: '/foo',
      size: 30,
      isFile: true
    },
    {
      path: '/bar',
      size: 30,
      isFile: true
    },
    {
      path: '/baz',
      size: 30,
      isFile: false
    }
  ]
  const wrapper = render(
    <FileList
      dat={{
        files
      }}
    />
  )

  t.equal(wrapper.find('tr').length, files.length)

  t.end()
})

test('file list should render a tr(s) even if directories without isEditing and size property given', t => {
  const files = [
    {
      path: '/foo'
    },
    {
      path: '/bar'
    },
    {
      path: '/baz'
    }
  ]
  const wrapper = render(
    <FileList
      dat={{
        files
      }}
    />
  )

  t.equal(wrapper.find('tr').length, files.length)

  t.end()
})
