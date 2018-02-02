'use strict'

import React, { Fragment } from 'react'
import styled from 'styled-components'
import { Green as GreenButton, Plain as PlainButton } from './button'

const Intro = styled.main`
    position: relative;
    height: 100vh;
    background-color: var(--color-neutral);
    color: var(--color-white);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    -webkit-app-region: drag;
    overflow: hidden;
`
const Content = styled.div`
    position: relative;
    flex: 1;
    width: 100vw;
    padding: 3rem 2rem;
`

const Footer = styled.div`
    position: relative;
    width: 100vw;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    button {
      min-width: 5rem;
    }
`
const Image = styled.img`
    max-width: 100vw;
    max-height: 100vh;
`

const IntroScreen = ({ show, screen, openHomepage, next, hide }) => {
  if (!show) return (
    <Fragment>
      <div></div>
    </Fragment>
  )

  return (
    <Intro>
      <Image src={'./assets/intro-'+(screen + 1)+'.svg'} alt='' className='absolute' />
      <Content>
        {{
          1: (
            <p className='mw5 f4'>
              Hey there! This is a Dat.
            </p>
          ),
          2: (
            <p className='mw5 f4'>
              Think of it as a folder – with some magic.
            </p>
          ),
          3: (
            <p className='mw5 f4'>
              You can turn any folder on your computer into a Dat.
            </p>
          ),
          4: (
            <p className='mw5 f4'>
              Dats can be easily shared.
              Just copy the unique dat link and securely share it.
            </p>
          ),
          5: (
            <p className='mw5 f4'>
              You can also import existing Dats.
              Check out <a href='https://datproject.org/' className='color-green-disabled hover-color-green' onClick={() => openHomepage()}>datproject.org</a> to explore open datasets.
            </p>
          )
        }[screen]}
      </Content>
      { screen === 1 
          ? (
            <GreenButton className="mt2 mb5 relative" onClick={() => next(screen)}>
              Get Started
            </GreenButton>
          )
          : (
            <Footer>
              <PlainButton onClick={() => hide()}>
                Skip Intro
              </PlainButton>
              { screen < 5 
                  ? (
                    <GreenButton onClick={() => next(screen)}>
                      Next
                    </GreenButton>
                  )
                  : (
                    <GreenButton onClick={() => hide()}>
                      Done
                    </GreenButton>
                  )
              }
            </Footer>
          )
      }
    </Intro>
  )
}

export default IntroScreen
