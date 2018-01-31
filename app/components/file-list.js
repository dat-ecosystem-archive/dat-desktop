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
      padding: .25rem .5rem;
    }
    tr:odd td {
      background-color: var(--color-neutral-04);
    }
  }
`

const List = ({ dat }) => (
  <FileListContainer>
    {dat && dat.files && dat.files.length
        ? (
          <FileListTable className="w-100 f7 f6-l ">
            <tbody>
              {dat.files.map(file => {
                var size = (Number(file.size) == file.size) && file.isFile
                  ? bytes(file.size)
                  : ''
                return (
                  <tr key={file.path}>
                    <td className="truncate mw5">
                      {file.path}
                    </td>
                    <td>
                      {size}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </FileListTable>
        )
        : (
          <div className="f7 f6-l pa2">
            N/A
          </div>
        )
    }
  </FileListContainer>
)

const FileList = ({ dat }) => (
  <FileListContainer className="flex-auto bg-white mb2 mw6">
    <List dat={dat} />
  </FileListContainer>
)

export default FileList
