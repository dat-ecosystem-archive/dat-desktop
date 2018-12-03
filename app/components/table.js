'use strict'

import React from 'react'
import styled from 'styled-components'
import TableRowContainer from '../containers/table-row'
import { Tr } from './table-row'
import Empty from './empty'

const StyledTable = styled.table`
  width: 100%;
  max-width: 80rem;
  margin: 0 auto;
  border-collapse: collapse;
  th,
  td {
    padding-right: 0.75rem;
    padding-left: 0.75rem;
    &:nth-child(2) {
      padding-left: 0;
    }
  }
  th {
    height: 4rem;
    font-size: 0.8125rem;
    font-weight: normal;
    color: var(--color-neutral-60);
    border-bottom: 1px solid var(--color-neutral-20);
    &:first-child {
      border: none;
    }
  }
  td {
    height: 4rem;
    vertical-align: top;
    padding-top: 1rem;
  }
  tr:hover td {
    background-color: var(--color-neutral--04);
  }
`

const Table = ({ dats, show }) => {
  if (!show) return null

  if (!Object.keys(dats).length) return <Empty />

  return (
    <main className='flex flex-column'>
      <StyledTable>
        <thead>
          <Tr>
            <th className='cell-1' />
            <th className='tl cell-2'>Link</th>
            <th className='tl cell-3'>Status</th>
            <th className='tl cell-4'>Size</th>
            <th className='tl cell-5'>Peers</th>
            <th className='cell-6' />
          </Tr>
        </thead>
      </StyledTable>
      <div className='flex-auto overflow-y-auto'>
        <StyledTable>
          <tbody>
            {Object.keys(dats).map(key => (
              <TableRowContainer key={key} dat={dats[key]} />
            ))}
          </tbody>
        </StyledTable>
      </div>
    </main>
  )
}

export default Table
