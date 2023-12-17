const { unload } = require("../../utils/ftp")

module.exports= async function (polaroid) {
    await polaroid.remove()
    await unload(polaroid.photo)
    polaroid.thumbnail && await unload(polaroid.thumbnail)
}