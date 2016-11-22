module.exports = (dat, cb) => {
  dat.listStream.destroy()
  dat.close(function (err) {
    if (err) return cb(err)
    dat.db.close(cb)
  })
}
