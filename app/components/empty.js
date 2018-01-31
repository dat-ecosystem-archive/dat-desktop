import React from 'react'
import styled from 'styled-components'
import Icon from './icon'

const Main = styled.main`
  position: relative;
  .skeleton {
    position: fixed;
    top: 3.5rem;
    left: 1.25rem;
    width: 232px;
    max-width: 100vw;
  }
  .dotted-lines {
    position: absolute;
    top: 0.25rem;
    right: 5.5rem;
    width: 17rem;
    z-index: 3;
  }
  .create-new-dat,
  .link {
    position: absolute;
    width: 15rem;
    color: var(--color-neutral-30);
    svg {
      display: inline-block;
      width: 2rem;
      height: 2rem;
    }
  }
  .create-new-dat {
    top: 14.5rem;
    right: 4rem;
  }
  .link {
    top: 6rem;
    right: 8.5rem;
    svg {
      margin-bottom: -0.75rem;
    }
  }
`

const Empty = () => (
  <Main>
    <img src='./assets/table-skeleton.svg' alt='' className='skeleton' />
    <div className='tutorial'>
      <img src='./assets/dotted-lines.svg' alt='' className='dotted-lines' />
      <div className='link'>
        <Icon name='link' />
        <h3 className='f4 ttu mt0 mb0'>Download A Dat</h3>
        <p className='f7'>
          … and keep data up-to-date
          <br />
          by entering the link here.
        </p>
      </div>
      <div className='tr create-new-dat'>
        <Icon name='create-new-dat' />
        <h3 className='f4 ttu mt0 mb0'>Share a Folder</h3>
        <p className='f7'>
          … and sync changes by sharing
          <br />
          the link with someone else.
        </p>
      </div>
    </div>
  </Main>
)

export default Empty
