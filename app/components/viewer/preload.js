const { ipcRenderer } = require('electron')

let currentId = 0.0

/*
;['log', 'warn', 'error', 'info'].forEach(function (prop) {
  const old = console[prop]
  console[prop] = function () {
    let arg = arguments[0]
    if (arguments.length > 1) {
      arg = Array.from(arguments).join(' ')
    }
    old.call(console, arg)
  }
})
*/

function nextId () {
  currentId += 1.0
  return currentId
}

function validateRange (file, start, end) {
  return file.size()
    .then(size => {
      if (start === undefined || start === null) {
        start = 0
      }
      if (end === undefined || end === null) {
        end = size
      }
      if (start > size) {
        throw new Error(`Can not create stream for ${file.datPath}[${start}:${end}] because start is out of bounds ${size}`)
      }
      if (end > size) {
        throw new Error(`Can not create stream for ${file.datPath}[${start}:${end}] because end is out of bounds ${size}`)
      }
      if (start > end) {
        throw new Error(`Can not create stream for ${file.datPath}[${start}:${end}] because start is after end`)
      }
      return {start, end}
    })
}

class EventEmitter {
  constructor () {
    this.removeAllListeners()
  }
  removeAllListeners () {
    this.handlers = {}
  }
  removeListener (event, handler) {
    const handlers = this.handlers[event]
    if (handlers === null || handlers === undefined) return
    if (handlers === handler) {
      delete this.handlers[event]
      return
    }
    if (Array.isArray(handlers)) {
      handlers.splice(handlers.findIndex(h => h === handler), 1)
      if (handlers.length === 1) {
        this.handlers[event] = handlers[0]
      }
    }
  }
  emit (event, ...args) {
    const handlers = this.handlers[event]
    // No handler
    if (handlers === null || handlers === undefined) return
    if (Array.isArray(handlers)) {
      // many handlers
      handlers.forEach(handler => handler(...args))
      return
    }
    // One handler
    handlers(...args)
  }
  on (event, handler) {
    let handlers = this.handlers[event]
    if (handlers === undefined) {
      throw new Error(`Event ${event} not supported! (Supported events: ${Object.keys(this.handlers)})`)
    }
    if (Array.isArray(handlers)) {
      handlers.push(handler)
      return
    }
    if (handlers !== null) {
      handlers = [handlers, handler]
    } else {
      handlers = handler
    }
    this.handlers[event] = handlers
  }
}

class Stream extends EventEmitter {
  constructor (file, start, end) {
    super()
    this.id = nextId()
    this.file = file
    this.start = start
    this.end = end
    this.removeAllListeners()
    validateRange(file, start, end)
      .then(({start, end}) =>
        ipcRenderer.sendToHost('viewer:stream', {
          cmd: 'open',
          start,
          end,
          id: this.id,
          datPath: file.datPath
        })
      )
      .catch(err => {
        console.warn(err)
        this.close(err)
      })
  }
  write (err, data) {
    if (this.closed) return
    if (err) {
      // marking it closed before emitting error!
      this.closed = true
      this.emit('error', err)
      // making sure that data is null!
      data = null
    }
    if (data === null) {
      this.closed = true
      this.emit('end')
      this.removeAllListeners()
    } else {
      this.emit('data', data)
    }
  }
  removeAllListeners () {
    this.handlers = {
      data: null,
      end: null,
      error: null
    }
  }
  close (err) {
    if (this.closed) return
    this.closed = true
    if (err) {
      this.emit('error', err)
    }
    this.emit('end')
    ipcRenderer.sendToHost('viewer:stream', {cmd: 'close', id: this.id})
    this.removeAllListeners()
  }
}

class File {
  constructor (datPath) {
    this.datPath = datPath
    this._streams = {}
    this._execs = {}
    this._stats = this.exec('init', this.datPath)
    this._size = this._stats.then(data => {
      return data.size
    })
  }
  exec (cmd, ...args) {
    if (this.destroyed) return
    const promise = exec({cmd, args})
    this._execs[promise.id] = true
    return promise
      .catch(err => {
        if (!this.destroyed) {
          delete this._execs[promise.id]
        }
        return Promise.reject(err)
      })
      .then((data) => {
        if (this.destroyed) return
        delete this._execs[promise.id]
        return data
      })
  }
  stats () {
    return this._stats
  }
  size () {
    return this._size
  }
  destroy () {
    if (this.destroyed) return
    this.destroyed = true
    Object.values(this._streams).forEach(stream => stream.close())
    this._streams = null
    Object.keys(this._execs).forEach(cancelExec)
    this._execs = null
  }
  read (start, end) {
    return validateRange(this, start, end)
      .then(({start, end}) => this.exec('read', this.datPath, start, end))
  }
  createReadStream (start, end) {
    const stream = createStream(this, start, end)
    this._streams[stream.id] = stream
    stream.on('end', () => {
      delete this._streams[stream.id]
    })
    return stream
  }
}

window.openFile = (datPath) => {
  return new File(datPath)
}
window.initViewer = () => {
  ipcRenderer.sendToHost('viewer:init')
}

const _cbs = {}
function cancelExec (id) {
  delete _cbs[id]
}

function exec (opts) {
  let cb
  const promise = new Promise((resolve, reject) => {
    cb = (err, data) => err ? reject(err) : resolve(data)
  })
  const id = nextId()
  promise.id = id
  opts.id = id
  _cbs[id] = cb
  ipcRenderer.sendToHost('viewer:exec', opts)
  return promise
}

const _streams = {}

function createStream (file, start, end) {
  const stream = new Stream(file, start, end)
  _streams[stream.id] = stream
  stream.on('end', () => delete _streams[stream.id])
  return stream
}

ipcRenderer.on('viewer:exec', function (_, id, error, data) {
  const cb = _cbs[id]
  if (!cb) return
  delete _cbs[id]
  cb(error, data)
})

ipcRenderer.on('viewer:stream', function (_, id, error, data) {
  const stream = _streams[id]
  if (!stream) return
  stream.write(error, data)
})

ipcRenderer.on('viewer:open', function (_, datPath) {
  var event = new window.Event('viewer:open')
  event.file = datPath
  window.dispatchEvent(event)
})
