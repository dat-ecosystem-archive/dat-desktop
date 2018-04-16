'use strict'

import Dat from 'dat-node'
import { encode } from 'dat-encoding'
import { homedir } from 'os'
import fs from 'fs'
import { basename } from 'path'
import { ipcRenderer, shell } from 'electron'
import mirror from 'mirror-folder'
import promisify from 'util-promisify'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)
const { Notification } = window

export default class DatMiddleware {
  constructor () {
    this.dats = {}
    this.listeners = []
    this.execByType = {
      UPDATE_TITLE: action => this.updateTitle(action),
      REMOVE_DAT: action => this.removeDat(action),
      TRY_ADD_DAT: action => this.tryAddDat(action),
      TOGGLE_PAUSE: action => this.togglePause(action),
      DOWNLOAD_SPARSE_DAT: action => this.downloadSparseDat(action),
      CANCEL_DOWNLOAD_DAT: action => this.cancelDownloadDat(action)
    }
  }

  execAction (action) {
    const exec = this.execByType[action.type]
    if (!exec) return false
    // Telling it to all the middlewares.
    this.dispatch(action)
    exec(action)
      .then(data =>
        this.dispatch({ ...action, type: `${action.type}_SUCCESS`, ...data })
      )
      .catch(error =>
        this.dispatch({ ...action, type: `${action.type}_ERROR`, error })
      )
    return true
  }

  middleware (store) {
    return dispatch => {
      this.listeners.push(dispatch)
      return action => {
        const triggersEffect = this.execAction(action)
        if (!triggersEffect) {
          // This action was not ment for this middleware.
          // Pass on to the next.
          dispatch(action)
        }
      }
    }
  }

  dispatch (action) {
    this.listeners.forEach(listener => listener(action))
  }

  async updateTitle ({ path, editValue }) {
    const filePath = `${path}/dat.json`
    const metadata = { ...getState().dats[key].metadata, title: editValue }

    try {
      await writeFile(filePath, JSON.stringify(metadata))
    } catch (error) {
      return this.dispatch({ type: 'WRITE_METADATA_ERROR', key, error })
    }
  }

  async removeDat ({ key }) {
    const { dat } = this.dats[key]

    if (dat.network) {
      for (const con of dat.network.connections) {
        con.removeAllListeners()
      }
    }
    dat.stats.removeAllListeners()
    clearInterval(dat.updateInterval)

    dat.close()
    delete this.dats[key]
    this.storeOnDisk()
  }

  async tryAddDat ({ key, path, paused, ...opts }) {
    if (key) key = encode(key)
    if (!path) path = `${homedir()}/Downloads/${key}`

    if (key) this.dispatch({ type: 'ADD_DAT', key, path, paused })
    opts = {
      watch: true,
      resume: true,
      ignoreHidden: true,
      compareFileContent: true,
      ...opts
    }

    Dat(path, { key }, (error, dat) => {
      if (error) return this.dispatch({ type: 'ADD_DAT_ERROR', key, error })
      if (!key) {
        key = encode(dat.key)
        this.dispatch({ type: 'ADD_DAT', key, path, paused })
      }

      dat.trackStats()
      if (dat.writable) dat.importFiles(opts)

      this.dispatch({
        type: 'DAT_METADATA',
        key,
        metadata: {
          title: basename(path),
          author: 'Anonymous'
        }
      })

      this.dispatch({ type: 'ADD_DAT_SUCCESS', key })
      this.dispatch({ type: 'DAT_WRITABLE', key, writable: dat.writable })

      dat.archive.readFile('/dat.json', (err, blob) => {
        if (err) return

        let metadata = {}
        try {
          metadata = JSON.parse(blob)
        } catch (_) {}

        this.dispatch({ type: 'DAT_METADATA', key, metadata })
      })

      if (dat.archive.content) this.walk(dat)
      else dat.archive.on('content', () => this.walk(dat))

      dat.stats.on('update', stats => {
        if (!stats) stats = dat.stats.get()
        this.updateProgress(dat, key, stats)
        this.dispatch({ type: 'DAT_STATS', key, stats: { ...stats } })
      })

      this.updateState(dat)
      this.updateProgress(dat, key)

      if (!paused) {
        this.joinNetwork(dat)
        this.updateConnections(dat)
      }

      let prevNetworkStats
      dat.updateInterval = setInterval(() => {
        const stats = JSON.stringify(dat.stats.network)
        if (stats === prevNetworkStats) return
        prevNetworkStats = stats
        this.dispatch({
          type: 'DAT_NETWORK_STATS',
          key,
          stats: {
            up: dat.stats.network.uploadSpeed,
            down: dat.stats.network.downloadSpeed
          }
        })
      }, 1000)

      this.dats[key] = { dat, path, opts }
      this.storeOnDisk()
    })
  }

  updateProgress (dat, key, stats) {
    if (!stats) stats = dat.stats.get()
    const prevProgress = dat.progress
    const progress = !dat.stats
      ? 0
      : dat.writable ? 1 : Math.min(1, stats.downloaded / stats.length)
    dat.progress = progress

    this.dispatch({ type: 'DAT_PROGRESS', key, progress })
    this.updateState(dat)

    const unfinishedBefore = prevProgress < 1 && prevProgress > 0
    if (dat.progress === 1 && unfinishedBefore) {
      const notification = new Notification('Download finished', {
        body: key
      })
      notification.onclick = () =>
        shell.openExternal(`file://${dat.path}`, () => {})
    }

    const incomplete = []
    for (const d of Object.values(this.dats)) {
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

  async togglePause ({ key, paused }) {
    const { dat } = this.dats[key]
    if (paused) {
      this.joinNetwork(dat)
    } else {
      dat.leaveNetwork()
    }
    this.storeOnDisk()
  }

  async downloadSparseDat ({ key }) {
    key = encode(key)
    const path = `${homedir()}/Downloads/${key}`

    this.dispatch({ type: 'ADD_DAT', key, path })

    Dat(path, { key, sparse: true }, (error, dat) => {
      if (error) return this.dispatch({ type: 'ADD_DAT_ERROR', key, error })

      dat.trackStats()

      this.dispatch({
        type: 'DAT_METADATA',
        key,
        metadata: {
          title: basename(path),
          author: 'Anonymous'
        }
      })

      this.dispatch({ type: 'ADD_DAT_SUCCESS', key })

      dat.archive.readFile('/dat.json', (err, blob) => {
        if (err) return

        let metadata = {}
        try {
          metadata = JSON.parse(blob)
        } catch (_) {}

        this.dispatch({ type: 'DAT_METADATA', key, metadata })
      })

      if (dat.archive.content) this.walk(dat)
      else dat.archive.on('content', () => this.walk(dat))

      dat.stats.on('update', stats => {
        if (!stats) stats = dat.stats.get()
        this.dispatch({ type: 'DAT_STATS', key, stats: { ...stats } })
      })

      this.updateState(dat)
      this.joinNetwork(dat)
      this.updateConnections(dat)

      this.dats[key] = { dat, path }
    })
  }

  async cancelDownloadDat (key) {
    key = encode(key)
    const { dat } = this.dats[key]

    for (const con of dat.network.connections) {
      con.removeAllListeners()
    }
    dat.stats.removeAllListeners()
    clearInterval(dat.updateInterval)

    dat.close()
    delete this.dats[key]
    this.dispatch({ type: 'REMOVE_DAT', key })
  }

  walk (dat) {
    const key = encode(dat.key)
    if (!dat.files) dat.files = []
    var fs = { name: '/', fs: dat.archive }
    var progress = mirror(fs, '/', { dryRun: true })
    progress.on('put', file => {
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
      this.dispatch({ type: 'DAT_FILES', key, files })
    })
  }

  updateState (dat) {
    const key = encode(dat.key)
    const state = !dat.network
      ? 'paused'
      : dat.writable || dat.progress === 1
        ? 'complete'
        : dat.network.connected ? 'loading' : 'stale'
    this.dispatch({ type: 'DAT_STATE', key, state })
  }

  updateConnections (dat) {
    if (!dat.network) return
    const key = encode(dat.key)
    this.dispatch({ type: 'DAT_PEERS', key, peers: dat.network.connected })
  }

  joinNetwork (dat) {
    dat.joinNetwork()
    dat.network.on('connection', con => {
      this.updateConnections(dat)
      this.updateState(dat)
      con.on('close', () => {
        this.updateConnections(dat)
        this.updateState(dat)
      })
    })
  }

  async loadFromDisk () {
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
      this.tryAddDat({
        key,
        path: opts.dir,
        paused: paused[key],
        ...opts
      })
    }
  }

  async storeOnDisk () {
    const dir = `${homedir()}/.dat-desktop`
    const datsState = Object.keys(this.dats).reduce(
      (acc, key) => ({
        ...acc,
        [key]: JSON.stringify({
          dir: this.dats[key].path,
          opts: this.dats[key].opts
        })
      }),
      {}
    )
    const pausedState = Object.keys(this.dats).reduce(
      (acc, key) => ({
        ...acc,
        [key]: !this.dats[key].dat.network
      }),
      {}
    )

    await writeFile(`${dir}/dats.json`, JSON.stringify(datsState))
    await writeFile(`${dir}/paused.json`, JSON.stringify(pausedState))
  }
}
