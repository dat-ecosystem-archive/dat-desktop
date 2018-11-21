'use strict'

import React from 'react'
import styled from 'styled-components'
import bytes from 'prettier-bytes'

const FileListTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  tr:odd td {
    background-color: var(--color-neutral-04);
  }
  td {
    border: 0;
  }
  td:last-child {
    width: 4rem;
    text-align: right;
  }
`

const FileList = ({ dat, fallback = null }) => {
  if (!dat || !dat.files || !dat.files.length) return fallback
  return (
    <FileListTable className='w-100 f7 f6-l'>
      <tbody>
        {dat.files.map(file => {
          const size =
            Number(file.size) === file.size && file.isFile
              ? bytes(file.size)
              : ''
          return (
            <tr key={file.path}>
              <td className='truncate'>{file.path}</td>
              <td>{size}</td>
            </tr>
          )
        })}
      </tbody>
    </FileListTable>
  )
}

export default FileList
