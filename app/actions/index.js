'use strict'

import { encode } from 'dat-encoding'
import { clipboard, remote, shell } from 'electron'
import fs from 'fs'
import promisify from 'util-promisify'
import path from 'path'

const stat = promisify(fs.stat)

function showOpenDialog (props) {
  if (process.env.RUNNING_IN_SPECTRON && process.env.OPEN_RESULT) {
    return [path.resolve(__dirname, process.env.OPEN_RESULT)]
  }
  return remote.dialog.showOpenDialog(props)
}

export const shareDat = key => ({ type: 'DIALOGS_LINK_OPEN', key })
export const copyLink = link => {
  clipboard.writeText(link)
  return { type: 'DIALOGS_LINK_COPY' }
}
export const closeShareDat = () => ({ type: 'DIALOGS_LINK_CLOSE' })

export const createDat = () => dispatch => {
  showOpenDialog({
    properties: ['openDirectory']
  }).then(({ filePaths, cancelled }) => {
    if (cancelled) return
    if (!filePaths) {
      console.error('Did not get files from the open dialog, closing')
      return
    }
    const path = filePaths[0]
    addDat({ path })(dispatch)
  }).catch((err) => {
    console.error(err)
  })
}
export const requestDownload = key => ({
  type: 'REQUEST_DOWNLOAD',
  key: encode(key)
})
export const hideDownloadScreen = () => ({ type: 'HIDE_DOWNLOAD_SCREEN' })
export const cancelDownloadDat = key => dispatch =>
  dispatch({ type: 'CANCEL_DOWNLOAD_DAT', key })
export const changeDownloadPath = key => dispatch => {
  const files = showOpenDialog({
    properties: ['openDirectory']
  })
  if (!files || !files.length) return
  const path = files[0]
  dispatch({ type: 'CHANGE_DOWNLOAD_PATH', key, path })
}

export const downloadSparseDat = ({ key }) => dispatch =>
  dispatch({ type: 'DOWNLOAD_SPARSE_DAT', key })
export const addDat = ({ key, path, paused, ...opts }) => dispatch =>
  dispatch({ type: 'TRY_ADD_DAT', key, path, paused, ...opts })
export const deleteDat = key => ({ type: 'DIALOGS_DELETE_OPEN', key })
export const confirmDeleteDat = key => dispatch => {
  dispatch({ type: 'REMOVE_DAT', key })
  dispatch({ type: 'DIALOGS_DELETE_CLOSE' })
}
export const cancelDeleteDat = () => ({ type: 'DIALOGS_DELETE_CLOSE' })
export const togglePause = ({ key, paused }) => dispatch =>
  dispatch({ type: 'TOGGLE_PAUSE', paused, key })

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

export const updateTitle = (key, title) => async dispatch =>
  dispatch({
    type: 'UPDATE_TITLE',
    key,
    title
  })

export const toggleMenu = visible => dispatch => {
  dispatch({ type: 'TOGGLE_MENU', visible })
}
