import React, { Component } from 'react'
import ReactDOM from 'react-dom'
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

const InputFieldStyle = styled.input`
  :focus {
    outline: none;
  }
`

class InputField extends Component {
  componentDidMount () {
    const input = ReactDOM.findDOMNode(this)
    input.focus()
    input.select()
  }
  render () {
    return <InputFieldStyle {...this.props} />
  }
}

class TitleField extends Component {
  constructor (props) {
    super(props)
    this.titleInput = React.createRef()
  }

  onclick (ev) {
    ev.stopPropagation()
    ev.preventDefault()
    this.setState({ editing: true })
  }

  commit () {
    const oldValue = this.props.value
    const newValue = ReactDOM.findDOMNode(this.titleInput.current).value
    if (oldValue !== newValue) {
      this.props.onChange(newValue)
    }
    this.cancel()
  }

  cancel () {
    this.setState({
      modified: false,
      editing: false
    })
  }

  handleKeyup (ev) {
    ev.stopPropagation()

    if (ev.key === 'Escape') {
      ev.preventDefault()
      this.cancel()
      return
    }

    if (ev.key === 'Enter') {
      ev.preventDefault()
      this.commit()
      return
    }

    const oldValue = this.props.value
    const newValue = ev.target.value
    const modified = oldValue !== newValue
    this.setState({ modified })
  }

  render () {
    const { writable, value } = this.props
    const { editing, modified } = this.state || {}
    if (editing && writable) {
      return (
        <div onClick={e => e.stopPropagation()}>
          <Overlay onClick={() => this.cancel()} />
          <EditableFieldWrapper className='bg-white nt1 nb1 nl1 shadow-1 flex justify-between'>
            {/* why innerRef in following component? check here - styled-components/styled-components#102 */}
            <InputField
              className='bn f6 pl1 normal w-100'
              defaultValue={value}
              onKeyUp={ev => this.handleKeyup(ev)}
              ref={this.titleInput}
            />
            {modified ? (
              <GreenButton onClick={() => this.commit()}>Save</GreenButton>
            ) : (
              <PlainButton onClick={() => this.cancel()}>Save</PlainButton>
            )}
          </EditableFieldWrapper>
        </div>
      )
    }

    if (writable) {
      return (
        <EditableFieldWrapper>
          <h2
            tabIndex='0'
            className='f6 f5-l normal truncate pr3'
            onClick={ev => this.onclick(ev)}
          >
            {value}
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
        <h2 className='f6 f5-l normal truncate pr3'>{value}</h2>
      </div>
    )
  }
}

export default TitleField
