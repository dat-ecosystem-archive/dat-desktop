const hyperImport = require('hyperdrive-import-files')
const dialog = require('electron').remote.dialog
const clipboard = require('electron').clipboard
const exec = require('child_process').exec
const encoding = require('dat-encoding')
const jsAlert = require('js-alert')
const html = require('choo/html')
const fs = require('fs')

module.exports = createModel

function createModel (rootDir, db, archives, drive, createArchive) {
  return {
    state: renderProps(),
    reducers: {
      update: renderProps
    }
  }
  function renderProps () {
    return {
      dats: archives,
      open: archive => {
        // TODO cross platform
        exec(`open "${archive.path}"`, err => {
          if (err) throw err
        })
      },
      share: dat => {
        const link = `dat://${encoding.encode(dat.key)}`
        clipboard.writeText(link)
        jsAlert.alert(html`
          <div>
            <p>Your dat link:</p>
            <p>
              <input type="text" value=${link}/>
            </p>
            <p>
              This link has also been copied to the clipboard for your
              convenience.
            </p>
          </div>
        `.outerHTML)
      },
      delete: dat => {
        db.del(['archive', dat.key], err => {
          if (err) throw err
        })
      },
      create: () => {
        const files = dialog.showOpenDialog({
          properties: ['openFile', 'openDirectory']
        })
        if (!files || !files.length) return
        const target = files[0]
        fs.stat(target, (err, stat) => {
          if (err) throw err

          const archive = createArchive(drive, {
            isFile: stat.isFile(),
            path: target
          })
          hyperImport(archive, target, err => {
            if (err) throw err
            archive.finalize(err => {
              if (err) throw err

              db.put(['archive', archive.key], {
                path: target,
                isFile: stat.isFile()
              })
            })
          })
        })
      },
      download: link => {
        const key = encoding.decode(link)
        const path = `${rootDir}/${encoding.encode(key)}`
        fs.mkdir(path, () => {
          db.put(['archive', key], {
            key: link,
            path: path
          })
        })
      }
    }
  }
}
