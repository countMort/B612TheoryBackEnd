const router    = require('express').Router(),
    verifyToken = require('../middlewares/verify-token'),
    isAdmin     = require("../middlewares/is-admin"),
    {
        giveNewPath,
        parseForm,
        putFile,
        mkdir,
        amrToMp3Function,
        upload
    }           = require('../routes/functions/uploadFunctions')
    responses   = require('../middlewares/responses');


router.post('/upload', verifyToken, async (req, res) => {
    try {
        const response = await upload('user', req)
        res.status(200).json(response)
    } catch (error) {
        console.log(error);
        responses(res, 500, [error.message || error])
    }
})

router.post('/upload/admin', [verifyToken, isAdmin], async (req, res) => {
    try {
        const response = await upload('admin', req)
        res.status(200).json(response)
    } catch (error) {
        console.log(error);
        responses(res, 500, [error.message || error])
    }
})

router.post('/upload/amr', verifyToken, async (req, res) => {
    try {
        const {files} = await parseForm(req)
        const path = await amrToMp3Function(files.file, files.file.path)
        const {time, newPath} = giveNewPath()
        await mkdir(newPath)
        let newFilePath = newPath + `/${req.decoded._id}-${time}-${files.file.name}`
        newFilePath = newFilePath.slice(0, newFilePath.length - 3) + 'mp3'
        const url = await putFile(path, newFilePath)
        const info = {
            url,
            name: files.file.name,
            size: files.file.size
        }
        return responses(res, 200, ['با فرمت جدید آپلود شد'], info)
    } catch (error) {
        console.log(error);
        responses(res, 500, [error.message || error])
    }
})

module.exports = router;
