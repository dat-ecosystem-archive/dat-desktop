var microcomponent = require('microcomponent')
var bytes = require('prettier-bytes')
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
    name: 'file-list'
  })
  component.on('render', render)
  component.on('update', update)
  return component

  function render () {
    var dat = this.props.dat
    return html`
      <div class="flex-auto bg-white mb2 mw6 ${fileListContainer}">
        ${dat && dat.files
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

  function update () {
    return true
  }
}
