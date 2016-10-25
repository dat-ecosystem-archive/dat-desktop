const hyperImport = require('hyperdrive-import-files')
const dialog = require('electron').remote.dialog
const clipboard = require('electron').clipboard
const exec = require('child_process').exec
const encoding = require('dat-encoding')
const jsAlert = require('js-alert')
const html = require('choo/html')
const assert = require('assert')
const fs = require('fs')

module.exports = createModel

function createModel (args) {
  assert.ok(args.createArchive, 'models/app: createArchive is not defined')
  assert.ok(args.archives, 'models/app: archives is not defined')
  assert.ok(args.drive, 'models/app: drive is not defined')
  assert.ok(args.db, 'models/app: db is not defined')

  return {
    namespace: 'app',
    state: renderProps(),
    reducers: {
      update: renderProps
    }
  }

  function renderProps () {
    return {
      dats: args.archives,
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
        args.db.del(['archive', dat.key], err => {
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

          const archive = args.createArchive(args.drive, {
            isFile: stat.isFile(),
            path: target
          })
          hyperImport(archive, target, err => {
            if (err) throw err
            archive.finalize(err => {
              if (err) throw err

              args.db.put(['archive', archive.key], {
                path: target,
                isFile: stat.isFile()
              })
            })
          })
        })
      },
      download: link => {
        const key = encoding.decode(link)
        const path = `${args.rootDir}/${encoding.encode(key)}`
        fs.mkdir(path, () => {
          args.db.put(['archive', key], {
            key: link,
            path: path
          })
        })
      }
    }
  }
}
