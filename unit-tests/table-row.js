import test from 'tape'
import React from 'react'
import { shallow } from 'enzyme'
import TableRow from '../app/components/table-row'

test('table row should render author as Anonymous if not present on dat', t => {
  const fn = () => {}
  const wrapper = shallow(
    <TableRow
      dat={{
        metadata: {},
        stats: []
      }}
      shareDat={fn}
      onDeleteDat={fn}
      inspectDat={fn}
      onTogglePause={fn}
    />
  )

  t.equal(wrapper.find('.author').text(), 'Anonymous • ')

  t.end()
})

test('table row should render author name if present on dat', t => {
  const fn = () => {}
  const wrapper = shallow(
    <TableRow
      dat={{
        metadata: {
          author: 'A-author'
        },
        stats: []
      }}
      shareDat={fn}
      onDeleteDat={fn}
      inspectDat={fn}
      onTogglePause={fn}
    />
  )

  t.equal(wrapper.find('.author').text(), 'A-author • ')

  t.end()
})

test('table row should render writable state as Read-only if not present on dat', t => {
  const fn = () => {}
  const wrapper = shallow(
    <TableRow
      dat={{
        metadata: {},
        stats: []
      }}
      shareDat={fn}
      onDeleteDat={fn}
      inspectDat={fn}
      onTogglePause={fn}
    />
  )

  t.equal(wrapper.find('.title').text(), 'Read-only')

  t.end()
})

test('table row should render writable state as Read & Write if dat is writable', t => {
  const fn = () => {}
  const wrapper = shallow(
    <TableRow
      dat={{
        metadata: {},
        stats: [],
        writable: true
      }}
      shareDat={fn}
      onDeleteDat={fn}
      inspectDat={fn}
      onTogglePause={fn}
    />
  )

  t.equal(wrapper.find('.title').text(), 'Read & Write')

  t.end()
})

test('table row should render size equals to 0 when length is not defined on dat', t => {
  const fn = () => {}
  const wrapper = shallow(
    <TableRow
      dat={{
        metadata: {},
        stats: {},
        writable: true
      }}
      shareDat={fn}
      onDeleteDat={fn}
      inspectDat={fn}
      onTogglePause={fn}
    />
  )

  t.equal(wrapper.find('.size').text(), '0 B')

  t.end()
})

test('table row should render size equals to length property on stats', t => {
  const fn = () => {}
  const wrapper = shallow(
    <TableRow
      dat={{
        metadata: {},
        stats: {
          length: 40
        },
        writable: true
      }}
      shareDat={fn}
      onDeleteDat={fn}
      inspectDat={fn}
      onTogglePause={fn}
    />
  )

  t.equal(wrapper.find('.size').text(), '40 B')

  t.end()
})

test('table row should render peers', t => {
  const fn = () => {}
  const wrapper = shallow(
    <TableRow
      dat={{
        metadata: {},
        stats: {
          length: 40
        },
        writable: true,
        peers: 2
      }}
      shareDat={fn}
      onDeleteDat={fn}
      inspectDat={fn}
      onTogglePause={fn}
    />
  )

  t.equal(wrapper.find('.network').text(), '2')

  t.end()
})
