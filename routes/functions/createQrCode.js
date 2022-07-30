const qrCode = require('qrcode')

module.exports = function (path, url) {
  return new Promise((resolve, reject) => {
    qrCode.toFile(path, url, {}, async function (err) {
      if (err) {
        console.log(err)
        reject(err)
      }
      resolve({ path, url, success: true })
    })
  })
}
