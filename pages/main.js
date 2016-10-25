const choo = require('choo')

module.exports = mainView

function mainView (err) {
  if (err) throw err
  const fresh = render({
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
      jsAlert.alert(yo`
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

        const archive = createArchive({
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
      const path = `${root}/${encoding.encode(key)}`
      fs.mkdir(path, () => {
        db.put(['archive', key], {
          key: link,
          path: path
        })
      })
    },
    logout: auth.logout
  })
}

