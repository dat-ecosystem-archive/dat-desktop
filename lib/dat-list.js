class List {
  constructor(db, manager) {
    this.DATABASE_KEY = 'links'
    this.db = db
    this.manager = manager
    this.multidat = manager._multidat
  }

  async share (directory) {
    return new Promise((resolve, reject) => {
      this.manager.create(directory, async (err, dat) => {
        if (err && err.warn) {
          console.warn(err)
        } else if (err) {
          return reject(err)
        }

        this.key = dat.key.toString('hex')

        await this.save()

        resolve(dat)
      })
    })
  }

  get list() {
    return this.multidat.list()
      .filter((e) => {
        if (e instanceof Error) {
          console.error('Error in dat list:', e.message)

          return false
        }

        return true
      })
      .map((e) => e.key.toString('hex'))
      .filter(e => e !== this.key)
  }

  async save () {
    return new Promise((resolve, reject) => {
      this.db.write(
        this.DATABASE_KEY,
        this.list,
        function(err) {
          if (err) {
            reject(err)
            return
          }

          resolve()
        }
      )
    })
  }
}

module.exports = List
