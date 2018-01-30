'use strict'

const defaultState = {
  dats: [],
  dialogs: {
    link: {
      link: null,
      copied: false
    }
  }
}

const redatApp = (state = defaultState, action) => {
  switch (action.type) {
    case 'ADD_DAT':
      return {...state,
        dats: {...state.dats,
          [action.key]: {
            key: action.key,
            path: action.path,
            loading: true,
            paused: false,
            metadata: {},
            stats: {
              network: {}
            }
          }
        }
      }
    case 'ADD_DAT_ERROR':
      return {...state,
        dats: {...state.dats,
          [action.key]: {...state.dats[action.key],
            error: action.error,
            loading: false
          }
        }
      }
    case 'ADD_DAT_SUCCESS':
      return {...state,
        dats: {...state.dats,
          [action.key]: {...state.dats[action.key],
            loading: false
          }
        }
      }
    case 'REMOVE_DAT':
      const { [action.key]: del, ...dats } = state.dats
      return { ...state, dats }
    case 'DAT_METADATA':
      return {...state,
        dats: {...state.dats,
          [action.key]: {...state.dats[action.key],
            metadata: action.metadata
          }
        }
      }
    case 'DAT_WRITABLE':
      return {...state,
        dats: {...state.dats,
          [action.key]: {...state.dats[action.key],
            writable: action.writable
          }
        }
      }
    case 'DAT_STATS':
      return {...state,
        dats: {...state.dats,
          [action.key]: {...state.dats[action.key],
            stats: {...state.dats[action.key].stats, ...action.stats}
          }
        }
      }
    case 'DAT_PROGRESS':
      return {...state,
        dats: {...state.dats,
          [action.key]: {...state.dats[action.key],
            progress: action.progress
          }
        }
      }
    case 'DAT_STATE':
      return {...state,
        dats: {...state.dats,
          [action.key]: {...state.dats[action.key],
            state: action.state
          }
        }
      }
    case 'DAT_NETWORK_STATS':
      return {...state,
        dats: {...state.dats,
          [action.key]: {...state.dats[action.key],
            stats: {...state.dats[action.key].stats, network: action.stats}
          }
        }
      }
    case 'DAT_PEERS':
      return {...state,
        dats: {...state.dats,
          [action.key]: {...state.dats[action.key],
            peers: action.peers
          }
        }
      }
    case 'DIALOGS_LINK_OPEN':
      return {...state,
        dialogs: {...state.dialogs,
          link: {
            link: action.key,
            copied: false
          }
        }
      }
    case 'DIALOGS_LINK_COPY':
      return {...state,
        dialogs: {...state.dialogs,
          link: {...state.dialogs.link,
            copied: true
          }
        }
      }
    case 'DIALOGS_LINK_CLOSE':
      return {...state,
        dialogs: {...state.dialogs,
          link: {
            link: null,
            copied: false
          }
        }
      }
    case 'PAUSE_DAT':
      return {...state,
        dats: {...state.dats,
          [action.key]: {...state.dats[action.key],
            paused: true,
            peers: 0,
          }
        }
      }
    case 'RESUME_DAT':
      return {...state,
        dats: {...state.dats,
          [action.key]: {...state.dats[action.key],
            paused: false,
            state: 'stale'
          }
        }
      }
    default:
      return state
  }
}

export default redatApp