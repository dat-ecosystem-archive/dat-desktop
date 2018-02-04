import React, { Component } from 'react'
import styled from 'styled-components'
import Icon from './icon'
import { Plain as PlainButton, Green as GreenButton } from './button'

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.2);
`

const EditableField = styled.div`
  position: relative;
  h2 {
    position: relative;
  }
  .indicator {
    position: absolute;
    display: none;
    top: 0.25rem;
    right: 0;
    width: 0.75rem;
  }
  &:hover,
  &:focus {
    h2 {
      color: var(--color-blue);
    }
    .indicator {
      display: block;
    }
  }
`

class TitleField extends Component {
  constructor (props) {
    super(props)
    this.onclick = this.onclick.bind(this)
    this.deactivate = this.deactivate.bind(this)
  }

  onclick (ev) {
    ev.stopPropagation()
    ev.preventDefault()
    this.props.makeEditable()
    setTimeout(() => {
      this.titleInput.focus()
      this.titleInput.select()
    }, 0)
  }

  deactivate () {
    this.props.deactivate()
  }

  handleSave () {
    const { key, path } = this.props.dat
    const editValue = this.props.editing.editValue
    this.props.updateTitle(key, path, editValue)
    this.props.deactivate()
  }

  handleKeypress (ev) {
    const oldValue = this.props.editing.editValue
    const newValue = ev.target.value
    const editValue = newValue
    ev.stopPropagation()

    if (ev.code === 'Escape') {
      ev.preventDefault()
      this.props.deactivate()
    } else if (ev.code === 'Enter') {
      ev.preventDefault()
      const { key, path } = this.props.dat
      this.props.updateTitle(key, path, editValue)
    } else if (oldValue !== newValue) {
      this.props.editTitle(newValue)
    }
  }

  render () {
    const { writable, metadata } = this.props.dat
    const { title } = metadata
    const { isEditing, placeholderTitle, editValue } = this.props.editing

    if (isEditing && writable) {
      return (
        <div>
          <Overlay onClick={() => this.deactivate()} />
          <EditableField className='bg-white nt1 nb1 nl1 pl1 shadow-1 flex justify-between'>
            <input
              className='bn f6 normal w-100'
              defaultValue={editValue || title}
              onKeyUp={ev => this.handleKeypress(ev)}
              ref={input => {
                this.titleInput = input
              }}
            />
            {editValue === title ? (
              <PlainButton onClick={ev => this.deactivate(ev)}>
                Save
              </PlainButton>
            ) : (
              <GreenButton onClick={() => this.handleSave()}>Save</GreenButton>
            )}
          </EditableField>
        </div>
      )
    }

    if (writable) {
      return (
        <EditableField>
          <h2
            className='f6 f5-l normal truncate pr3'
            onClick={ev => this.onclick(ev)}
          >
            {title || placeholderTitle}
            <Icon
              name='edit'
              className='absolute top-0 bottom-0 right-0 color-neutral-30 indicator'
            />
          </h2>
        </EditableField>
      )
    }

    return (
      <div>
        <h2 className='f6 f5-l normal truncate pr3'>
          {title || placeholderTitle}
        </h2>
      </div>
    )
  }
}

export default TitleField
