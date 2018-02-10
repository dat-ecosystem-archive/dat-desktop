'use strict'

import React from 'react'
import styled from 'styled-components'
import bytes from 'prettier-bytes'

const FileListContainer = styled.div`
  :host {
    min-height: 5rem;
  }
`

const FileListTable = styled.table`
  :host {
    td {
      padding: 0.25rem 0.5rem;
    }
    tr:odd td {
      background-color: var(--color-neutral-04);
    }
  }
`

const FileList = ({ dat, onClickFile }) => (
  <FileListContainer className='flex-auto bg-white mb2 mw6'>
    {dat && dat.files && dat.files.length ? (
      <FileListTable className='w-100 f7 f6-l '>
        <tbody>
          {dat.files.map(file => {
            const size =
              Number(file.size) === file.size && file.isFile
                ? bytes(file.size)
                : ''
            return (
              <tr key={file.path} onClick={() => onClickFile(file.path)}>
                <td className='truncate mw5'>{file.path}</td>
                <td>{size}</td>
              </tr>
            )
          })}
        </tbody>
      </FileListTable>
    ) : (
      <div className='f7 f6-l pa2'>N/A</div>
    )}
  </FileListContainer>
)

export default FileList
