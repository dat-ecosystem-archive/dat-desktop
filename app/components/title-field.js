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

const EditableFieldWrapper = styled.div`
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

const InputField = styled.input`
  :focus {
    outline: none;
  }
`

class TitleField extends Component {
  constructor (props) {
    super(props)
    this.onclick = this.onclick.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.deactivateTitleEditing = this.deactivateTitleEditing.bind(this)
  }

  onclick (ev) {
    ev.stopPropagation()
    ev.preventDefault()
    this.props.activateTitleEditing()

    // setTimeout? Because ref on input is set asynchronously, and later. So we can't do focus, select on it until ref is set
    setTimeout(() => {
      this.titleInput.focus()
      this.titleInput.select()
    }, 0)
  }

  deactivateTitleEditing () {
    this.props.deactivateTitleEditing()
  }

  handleSave () {
    const { key, path } = this.props.dat
    const { editValue } = this.props.titleUnderEdit
    if (editValue) this.props.updateTitle(key, path, editValue)
    this.props.deactivateTitleEditing()
  }

  handleKeyup (ev) {
    const oldValue = this.props.titleUnderEdit.editValue
    const newValue = ev.target.value
    ev.stopPropagation()

    if (ev.key === 'Escape') {
      ev.preventDefault()
      this.props.deactivateTitleEditing()
    } else if (ev.key === 'Enter') {
      ev.preventDefault()
      this.handleSave()
    } else if (oldValue !== newValue) {
      this.props.editTitle(newValue)
    }
  }

  render () {
    const { dat, titleUnderEdit } = this.props
    const { isEditing, editValue } = titleUnderEdit
    const { writable, metadata, key } = dat
    const { title } = metadata
    const placeholderTitle = `#${key}`

    if (isEditing && writable) {
      return (
        <div>
          <Overlay onClick={() => this.deactivateTitleEditing()} />
          <EditableFieldWrapper className='bg-white nt1 nb1 nl1 shadow-1 flex justify-between'>
            { /* why innerRef in following component? check here - styled-components/styled-components#102 */}
            <InputField
              className='bn f6 pl1 normal w-100'
              defaultValue={editValue || title}
              onKeyUp={ev => this.handleKeyup(ev)}
              innerRef={input => {
                this.titleInput = input
              }}
            />
            {editValue === title ? (
              <PlainButton onClick={ev => this.deactivateTitleEditing(ev)}>
                Save
              </PlainButton>
            ) : (
              <GreenButton onClick={() => this.handleSave()}>Save</GreenButton>
            )}
          </EditableFieldWrapper>
        </div>
      )
    }

    if (writable) {
      return (
        <EditableFieldWrapper>
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
        </EditableFieldWrapper>
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
