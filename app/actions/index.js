'use strict'

import Dat from 'dat-node'
import { encode } from 'dat-encoding'
import { homedir } from 'os'
import { clipboard, remote, ipcRenderer, shell } from 'electron'
import mirror from 'mirror-folder'
import fs from 'fs'
import promisify from 'util-promisify'
import { basename } from 'path'

const dats = {}

const stat = promisify(fs.stat)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)
const { Notification } = window

export const shareDat = key => ({ type: 'DIALOGS_LINK_OPEN', key })
export const copyLink = link => {
  clipboard.writeText(link)
  return { type: 'DIALOGS_LINK_COPY' }
}
export const closeShareDat = () => ({ type: 'DIALOGS_LINK_CLOSE' })

export const createDat = () => dispatch => {
  const files = remote.dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (!files || !files.length) return
  const path = files[0]
  addDat({ path })(dispatch)
}

export const addDat = ({ key, path, paused, ...opts }) => dispatch => {
  if (key) key = encode(key)
  if (!path) path = `${homedir()}/Downloads/${key}`

  if (key) dispatch({ type: 'ADD_DAT', key, path, paused })
  opts = {
    watch: true,
    resume: true,
    ignoreHidden: true,
    compareFileContent: true,
    ...opts
  }

  Dat(path, { key }, (error, dat) => {
    if (error) return dispatch({ type: 'ADD_DAT_ERROR', key, error })
    if (!key) {
      key = encode(dat.key)
      dispatch({ type: 'ADD_DAT', key, path, paused })
    }

    dat.trackStats()
    if (dat.writable) dat.importFiles(opts)

    dispatch({
      type: 'DAT_METADATA',
      key,
      metadata: {
        title: basename(path),
        author: 'Anonymous'
      }
    })

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

    dispatch(updateState(dat))

    const updateProgress = stats => {
      if (!stats) stats = dat.stats.get()
      const prevProgress = dat.progress
      const progress = !dat.stats
        ? 0
        : dat.writable ? 1 : Math.min(1, stats.downloaded / stats.length)
      dat.progress = progress

      dispatch({ type: 'DAT_PROGRESS', key, progress })
      dispatch(updateState(dat))

      const unfinishedBefore = prevProgress < 1 && prevProgress > 0
      if (dat.progress === 1 && unfinishedBefore) {
        const notification = new Notification('Download finished', {
          body: key
        })
        notification.onclick = () =>
          shell.openExternal(`file://${dat.path}`, () => {})
      }

      const incomplete = []
      for (const d of Object.values(dats)) {
        if (d.network && d.progress < 1) incomplete.push(d)
      }
      let totalProgress = incomplete.length
        ? incomplete.reduce((acc, dat) => {
          return acc + dat.progress
        }, 0) / incomplete.length
        : 1
      if (totalProgress === 1) totalProgress = -1 // deactivate
      if (ipcRenderer) ipcRenderer.send('progress', totalProgress)
    }
    updateProgress()

    if (!paused) {
      joinNetwork(dat)(dispatch)
      updateConnections(dat)(dispatch)
    }

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

    dats[key] = { dat, path, opts }
    storeOnDisk()
  })
}

const joinNetwork = dat => dispatch => {
  dat.joinNetwork()
  dat.network.on('connection', con => {
    updateConnections(dat)(dispatch)
    dispatch(updateState(dat))
    con.on('close', () => {
      updateConnections(dat)(dispatch)
      dispatch(updateState(dat))
    })
  })
}

const updateConnections = dat => dispatch => {
  if (!dat.network) return
  const key = encode(dat.key)
  dispatch({ type: 'DAT_PEERS', key, peers: dat.network.connected })
}

const updateState = dat => {
  const key = encode(dat.key)
  const state = !dat.network
    ? 'paused'
    : dat.writable || dat.progress === 1
      ? 'complete'
      : dat.network.connected ? 'loading' : 'stale'
  return { type: 'DAT_STATE', key, state }
}

export const deleteDat = key => ({ type: 'DIALOGS_DELETE_OPEN', key })
export const confirmDeleteDat = key => dispatch => {
  const { dat } = dats[key]

  if (dat.network) {
    for (const con of dat.network.connections) {
      con.removeAllListeners()
    }
  }
  dat.stats.removeAllListeners()
  clearInterval(dat.updateInterval)

  dat.close()
  delete dats[key]
  storeOnDisk()
  dispatch({ type: 'REMOVE_DAT', key })
  dispatch({ type: 'DIALOGS_DELETE_CLOSE' })
}
export const cancelDeleteDat = () => ({ type: 'DIALOGS_DELETE_CLOSE' })

export const togglePause = ({ key, paused }) => dispatch => {
  const { dat } = dats[key]
  if (paused) {
    joinNetwork(dat)(dispatch)
  } else {
    dat.leaveNetwork()
  }
  storeOnDisk()
  if (paused) {
    dispatch({ type: 'RESUME_DAT', key: key })
  } else {
    dispatch({ type: 'PAUSE_DAT', key: key })
  }
}

export const inspectDat = key => dispatch => {
  dispatch({ type: 'INSPECT_DAT', key })
}
export const closeInspectDat = () => ({ type: 'INSPECT_DAT_CLOSE' })

export const dropFolder = folder => async dispatch => {
  const isDirectory = (await stat(folder.path)).isDirectory()
  if (!isDirectory) return
  addDat({ path: folder.path })(dispatch)
}

export const openHomepage = () => shell.openExternal('https://datproject.org/')
export const nextIntro = screen => ({ type: 'NEXT_INTRO', screen })
export const hideIntro = () => ({ type: 'HIDE_INTRO' })

export const activateTitleEditing = title => ({
  type: 'ACTIVATE_TITLE_EDITING',
  title
})

export const updateTemporaryTitleValue = title => ({
  type: 'UPDATE_TEMPORARY_TITLE_VALUE',
  title
})

export const updateTitle = (key, path, editValue) => async dispatch => {
  const filePath = `${path}/dat.json`
  const blob = await readFile(filePath)
  const metadata = { ...JSON.parse(blob), title: editValue }
  await writeFile(filePath, JSON.stringify(metadata))

  dispatch({
    type: 'UPDATE_TITLE',
    key,
    editValue
  })
}

export const deactivateTitleEditing = () => ({
  type: 'DEACTIVATE_TITLE_EDITING'
})

export const loadFromDisk = () => async dispatch => {
  try {
    await mkdir(`${homedir()}/.dat-desktop`)
  } catch (_) {}

  let blob
  try {
    blob = await readFile(`${homedir()}/.dat-desktop/dats.json`, 'utf8')
  } catch (_) {
    return
  }
  const datOpts = JSON.parse(blob)

  blob = {}
  try {
    blob = await readFile(`${homedir()}/.dat-desktop/paused.json`, 'utf8')
  } catch (_) {}
  const paused = JSON.parse(blob)

  for (const key of Object.keys(datOpts)) {
    const opts = JSON.parse(datOpts[key])
    addDat({
      key: key,
      path: opts.dir,
      paused: paused[key],
      ...opts
    })(dispatch)
  }
}

const storeOnDisk = async () => {
  const dir = `${homedir()}/.dat-desktop`
  const datsState = Object.keys(dats).reduce(
    (acc, key) => ({
      ...acc,
      [key]: JSON.stringify({
        dir: dats[key].path,
        opts: dats[key].opts
      })
    }),
    {}
  )
  const pausedState = Object.keys(dats).reduce(
    (acc, key) => ({
      ...acc,
      [key]: !dats[key].dat.network
    }),
    {}
  )

  await writeFile(`${dir}/dats.json`, JSON.stringify(datsState))
  await writeFile(`${dir}/paused.json`, JSON.stringify(pausedState))
}
