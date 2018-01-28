'use strict'

import React from 'react'
import styled from 'styled-components'
import TableRow from './table-row'

const StyledTable = styled.table`
  width: 100%;
  max-width: 80rem;
  margin: 0 auto;
  border-collapse: collapse;
  th,
  td {
    padding-right: .75rem;
    padding-left: .75rem;
  }
  th {
    height: 4rem;
    font-size: .8125rem;
    font-weight: normal;
    color: var(--color-neutral-60);
    border-bottom: 1px solid var(--color-neutral-20);
    &:first-child {
      width: 3rem;
      padding: 0;
      border: none;
    }
    &:last-child {
      width: 8.25rem;
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

const Table = ({ dats, shareDat, onDeleteDat }) => (
  <main>
    <StyledTable>
       <thead>
        <tr>
          <th className="cell-1"></th>
          <th className="tl cell-2">Link</th>
          <th className="tl cell-3">Status</th>
          <th className="tl cell-4">Size</th>
          <th className="tl cell-5">Peers</th>
          <th className="cell-6"></th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(dats).map(key => (
          <TableRow dat={dats[key]} key={key} shareDat={shareDat} onDeleteDat={onDeleteDat} />
        ))}
      </tbody>
    </StyledTable>
  </main>
)

export default Table
