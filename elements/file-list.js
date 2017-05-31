var microcomponent = require('microcomponent')
var bytes = require('prettier-bytes')
var mirror = require('mirror-folder')
var html = require('choo/html')
var css = require('sheetify')

var fileListContainer = css`
  :host {
    min-height: 5rem;
  }
`

var fileList = css`
  :host {
    td {
      padding: .25rem .5rem;
    }
    tr:odd td {
      background-color: var(--color-neutral-04);
    }
  }
`

module.exports = function () {
  var component = microcomponent({
    name: 'file-list',
    state: {
      update: true
    }
  })
  component.on('render', render)
  component.on('update', update)
  return component

  function render () {
    var { dat, onupdate } = this.props

    if (dat) {
      if (dat.files) {
        this.state.update = false
      } else {
        if (dat.archive) {
          dat.files = []
          if (dat.archive.content) walk()
          else dat.archive.on('content', walk)
        }
      }
    }

    function walk () {
      var fs = { name: '/', fs: dat.archive }
      var progress = mirror(fs, '/', { dryRun: true })
      progress.on('put', function (file) {
        file.name = file.name.slice(1)
        if (file.name === '') return
        dat.files.push({
          path: file.name,
          stat: file.stat
        })
        dat.files.sort(function (a, b) {
          return a.path.localeCompare(b.path)
        })
        component.state.update = true
        onupdate()
      })
    }

    return html`
      <div class="flex-auto bg-white mb2 mw6 ${fileListContainer}">
        ${dat && dat.files && dat.files.length
          ? html`
            <table class="w-100 f7 f6-l ${fileList}">
              ${dat.files.map(file => {
                var size = file.stat && file.stat.isFile()
                  ? ` ${bytes(file.stat.size)}`
                  : ''
                return html`
                  <tr>
                    <td class="truncate mw5">
                      ${file.path}
                    </td>
                    <td>
                      ${size}
                    </td>
                  </tr>
                `
              })}
            </table>
            `
          : html`
            <div class="f7 f6-l pa2">
              N/A
            </div>
          `
        }
      </div>
    `
  }

  function update (props) {
    return props.dat !== this.props.dat || this.state.update
  }
}
