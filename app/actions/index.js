'use strict'

import Dat from 'dat-node'
import { encode } from 'dat-encoding'
import { homedir } from 'os'
import { clipboard } from 'electron'
import mirror from 'mirror-folder'
import fs from 'fs'
import promisify from 'util-promisify'
import { basename } from 'path'

const dats = new Map()

const stat = promisify(fs.stat)

export const shareDat = key => ({ type: 'DIALOGS_LINK_OPEN', key })
export const copyLink = link => {
  clipboard.writeText(link)
  return { type: 'DIALOGS_LINK_COPY' }
}
export const closeShareDat = () => ({ type: 'DIALOGS_LINK_CLOSE' })

export const addDat = ({ key, path }) => dispatch => {
  if (key) key = encode(key)
  if (!path) path = `${homedir()}/Downloads/${key}`
  if (key) dispatch({ type: 'ADD_DAT', key, path })

  Dat(path, { key }, (error, dat) => {
    if (error) return dispatch({ type: 'ADD_DAT_ERROR', key, error })
    if (!key) {
      key = encode(dat.key)
      dispatch({ type: 'ADD_DAT', key, path })
    }

    dat.joinNetwork()
    dat.trackStats()
    if (dat.writable) dat.importFiles()

    dispatch({
      type: 'DAT_METADATA',
      key,
      metadata: {
        title: basename(path),
        author: 'Anonymous'
      }
    })

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

    const walk = () => {
      if (!dat.files) dat.files = []
      var fs = { name: '/', fs: dat.archive }
      var progress = mirror(fs, '/', { dryRun: true })
      progress.on('put', function (file) {
        file.name = file.name.slice(1)
        if (file.name === '') return
        dat.files.push({
          path: file.name,
          size: file.stat.size,
          isFile: file.stat.isFile()
        })
        dat.files.sort(function (a, b) {
          return a.path.localeCompare(b.path)
        })

        const { files } = dat
        dispatch({ type: 'DAT_FILES', key, files })
      })
    }

    if (dat.archive.content) walk()
    else dat.archive.on('content', walk)

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

export const inspectDat = key => dispatch => {
  dispatch({ type: 'INSPECT_DAT', key })
}

export const closeInspectDat = () => ({ type: 'INSPECT_DAT_CLOSE' })

export const dropFolder = folder => async dispatch => {
  const isDirectory = (await stat(folder.path)).isDirectory()
  if (!isDirectory) return
  addDat({ path: folder.path })(dispatch)
}

export const updateTitle = (key, path, editValue) => ({
  type: 'UPDATE_TITLE',
  key,
  editValue
})

export const makeEditable = title => ({ type: 'MAKE_EDITABLE', title })

export const editTitle = title => ({ type: 'EDIT_TITLE', title })

export const deactivate = () => ({ type: 'DEACTIVATE_EDITING' })
