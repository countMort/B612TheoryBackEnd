const { unload }    = require('../../utils/ftp')

module.exports= async function (diaryBook) {
    await diaryBook.remove()
    if (diaryBook.photos) {
        for (let key in diaryBook.photos) {
            await unload(diaryBook.photos[key])
        }
    }
    await unload(diaryBook.video)
}