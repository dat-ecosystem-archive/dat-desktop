import React from 'react'
import styled from 'styled-components'
import FileDrop from 'react-file-drop'
import { connect } from 'react-redux'
import { dropFolder } from '../actions'
import Icon from '../components/icon'

const mapStateToProps = state => ({})

const mapDispatchToProps = dispatch => ({
  onDrop: list => dispatch(dropFolder(list[0]))
})

const DropFrame = styled(FileDrop)`
  .file-drop-target {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(42, 202, 75, 0.6);
    align-items: center;
    justify-content: center;
    z-index: 1;
    display: none;
  }
  .file-drop-dragging-over-frame {
    display: flex;
  }
`

const DropIcon = styled(Icon)`
  width: 128px;
  color: white;
`

const DragDropContainer = connect(mapStateToProps, mapDispatchToProps)(function (
  props
) {
  return (
    <DropFrame {...props}>
      <DropIcon name='create-new-dat' />
    </DropFrame>
  )
})

export default DragDropContainer
