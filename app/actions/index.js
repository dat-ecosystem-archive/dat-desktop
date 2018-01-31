'use strict'

import Dat from 'dat-node'
import { encode } from 'dat-encoding'
import { homedir } from 'os'
import { clipboard } from 'electron'

const dats = new Map()

export const shareDat = key => ({ type: 'DIALOGS_LINK_OPEN', key })
export const copyLink = link => {
  clipboard.writeText(link)
  return { type: 'DIALOGS_LINK_COPY' }
}
export const closeShareDat = () => ({ type: 'DIALOGS_LINK_CLOSE' })

export const addDat = key => dispatch => {
  key = encode(key)
  const path = `${homedir()}/Downloads/${key}`
  dispatch({ type: 'ADD_DAT', key, path })

  Dat(path, { key }, (error, dat) => {
    if (error) return dispatch({ type: 'ADD_DAT_ERROR', key, error })

    dat.joinNetwork()
    dat.trackStats()

    dats.set(key, dat)
    dispatch({ type: 'ADD_DAT_SUCCESS', key })
    dispatch({ type: 'DAT_WRITABLE', key, writable: dat.writable })

    dat.archive.readFile('/dat.json', (err, blob) => {
      if (err) return

      let metadata = {}
      try {
        metadata = JSON.parse(blob)
      } catch (_) {}

      dispatch({ type: 'DAT_METADATA', key, metadata })
    })

    dat.stats.on('update', stats => {
      if (!stats) stats = dat.stats.get()
      updateProgress(stats)
      dispatch({ type: 'DAT_STATS', key, stats: { ...stats } })
    })

    const updateState = () => {
      const state = !dat.network
        ? 'paused'
        : dat.writable || dat.progress === 1
          ? 'complete'
          : dat.network.connected ? 'loading' : 'stale'
      dispatch({ type: 'DAT_STATE', key, state })
    }
    updateState()

    const updateProgress = stats => {
      if (!stats) stats = dat.stats.get()
      const progress = !dat.stats
        ? 0
        : dat.writable ? 1 : Math.min(1, stats.downloaded / stats.length)
      dat.progress = progress
      dispatch({ type: 'DAT_PROGRESS', key, progress })
      updateState()
    }
    updateProgress()

    dat.network.on('connection', con => {
      updateConnections()
      updateState()
      con.on('close', () => {
        updateConnections()
        updateState()
      })
    })

    const updateConnections = () => {
      if (dat.network) {
        dispatch({ type: 'DAT_PEERS', key, peers: dat.network.connected })
      }
    }
    updateConnections()

    let prevNetworkStats
    dat.updateInterval = setInterval(() => {
      const stats = JSON.stringify(dat.stats.network)
      if (stats === prevNetworkStats) return
      prevNetworkStats = stats
      dispatch({
        type: 'DAT_NETWORK_STATS',
        key,
        stats: {
          up: dat.stats.network.uploadSpeed,
          down: dat.stats.network.downloadSpeed
        }
      })
    }, 1000)
  })
}

export const deleteDat = key => ({ type: 'DIALOGS_DELETE_OPEN', key })
export const confirmDeleteDat = key => dispatch => {
  const dat = dats.get(key)

  for (const con of dat.network.connections) {
    con.removeAllListeners()
  }
  dat.stats.removeAllListeners()
  clearInterval(dat.updateInterval)

  dat.close()

  dats.delete(key)
  dispatch({ type: 'REMOVE_DAT', key })
  dispatch({ type: 'DIALOGS_DELETE_CLOSE' })
}
export const cancelDeleteDat = () => ({ type: 'DIALOGS_DELETE_CLOSE' })
