const ToiletDb = require('toiletdb')

async function ToiletDbAsync(path) {
  return new Promise((resolve, reject) => {
    const toilet = ToiletDb(path)

    toilet.open((err) => err ? reject(err) : resolve(toilet))
  })
}

module.exports = ToiletDbAsync
