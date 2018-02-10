'use strict'

const defaultState = {
  dats: [],
  dialogs: {
    link: {
      link: null,
      copied: false
    },
    delete: {
      dat: null
    }
  },
  speed: {
    up: 0,
    down: 0
  },
  inspect: { key: null },
  titleEditInPlace: {
    isEditing: false,
    editValue: null
  }
}

const redatApp = (state = defaultState, action) => {
  switch (action.type) {
    case 'ADD_DAT':
      return {
        ...state,
        dats: {
          ...state.dats,
          [action.key]: {
            key: action.key,
            path: action.path,
            loading: true,
            paused: action.paused,
            metadata: {},
            stats: {
              network: {
                up: 0,
                down: 0
              }
            }
          }
        }
      }
    case 'ADD_DAT_ERROR':
      return {
        ...state,
        dats: {
          ...state.dats,
          [action.key]: {
            ...state.dats[action.key],
            error: action.error,
            loading: false
          }
        }
      }
    case 'ADD_DAT_SUCCESS':
      return {
        ...state,
        dats: {
          ...state.dats,
          [action.key]: {
            ...state.dats[action.key],
            loading: false
          }
        }
      }
    case 'REMOVE_DAT':
      const { [action.key]: del, ...dats } = state.dats
      return { ...state, dats }
    case 'INSPECT_DAT':
      return {
        ...state,
        inspect: {
          ...state.inspect,
          key: action.key
        }
      }
    case 'INSPECT_DAT_CLOSE':
      return {
        ...state,
        inspect: {
          ...state.inspect,
          key: null
        }
      }
    case 'DAT_FILES':
      return {
        ...state,
        dats: {
          ...state.dats,
          [action.key]: {
            ...state.dats[action.key],
            files: action.files
          }
        }
      }
    case 'DAT_METADATA':
      return {
        ...state,
        dats: {
          ...state.dats,
          [action.key]: {
            ...state.dats[action.key],
            metadata: action.metadata
          }
        }
      }
    case 'DAT_WRITABLE':
      return {
        ...state,
        dats: {
          ...state.dats,
          [action.key]: {
            ...state.dats[action.key],
            writable: action.writable
          }
        }
      }
    case 'DAT_STATS':
      return {
        ...state,
        dats: {
          ...state.dats,
          [action.key]: {
            ...state.dats[action.key],
            stats: { ...state.dats[action.key].stats, ...action.stats }
          }
        }
      }
    case 'DAT_PROGRESS':
      return {
        ...state,
        dats: {
          ...state.dats,
          [action.key]: {
            ...state.dats[action.key],
            progress: action.progress
          }
        }
      }
    case 'DAT_STATE':
      return {
        ...state,
        dats: {
          ...state.dats,
          [action.key]: {
            ...state.dats[action.key],
            state: action.state
          }
        }
      }
    case 'DAT_NETWORK_STATS':
      return {
        ...state,
        dats: {
          ...state.dats,
          [action.key]: {
            ...state.dats[action.key],
            stats: { ...state.dats[action.key].stats, network: action.stats }
          }
        },
        speed: {
          up:
            state.speed.up -
            state.dats[action.key].stats.network.up +
            action.stats.up,
          down:
            state.speed.down -
            state.dats[action.key].stats.network.down +
            action.stats.down
        }
      }
    case 'DAT_PEERS':
      return {
        ...state,
        dats: {
          ...state.dats,
          [action.key]: {
            ...state.dats[action.key],
            peers: action.peers
          }
        }
      }
    case 'ACTIVATE_TITLE_EDITING':
      return {
        ...state,
        titleEditInPlace: {
          ...state.titleEditInPlace,
          isEditing: true
        }
      }
    case 'UPDATE_TEMPORARY_TITLE_VALUE':
      return {
        ...state,
        titleEditInPlace: {
          ...state.titleEditInPlace,
          editValue: action.title
        }
      }
    case 'UPDATE_TITLE':
      return {
        ...state,
        dats: {
          ...state.dats,
          [action.key]: {
            ...state.dats[action.key],
            metadata: {
              ...state.dats[action.key].metadata,
              title: action.editValue
            }
          }
        }
      }
    case 'DEACTIVATE_TITLE_EDITING':
      return {
        ...state,
        titleEditInPlace: {
          isEditing: false,
          editValue: null
        }
      }
    case 'DIALOGS_LINK_OPEN':
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          link: {
            link: action.key,
            copied: false
          }
        }
      }
    case 'DIALOGS_LINK_COPY':
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          link: {
            ...state.dialogs.link,
            copied: true
          }
        }
      }
    case 'DIALOGS_LINK_CLOSE':
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          link: {
            link: null,
            copied: false
          }
        }
      }
    case 'DIALOGS_DELETE_OPEN':
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          delete: {
            dat: action.key
          }
        }
      }
    case 'DIALOGS_DELETE_CLOSE':
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          delete: {
            dat: null
          }
        }
      }
    case 'PAUSE_DAT':
      return {
        ...state,
        dats: {
          ...state.dats,
          [action.key]: {
            ...state.dats[action.key],
            paused: true,
            peers: 0
          }
        }
      }
    case 'RESUME_DAT':
      return {
        ...state,
        dats: {
          ...state.dats,
          [action.key]: {
            ...state.dats[action.key],
            paused: false
          }
        }
      }
    default:
      return state
  }
}

export default redatApp
