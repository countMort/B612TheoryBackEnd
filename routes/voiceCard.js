const { createZip } = require('./functions/export');

const router = require('express').Router(),
    VoiceCard = require('../models/voiceCard'),
    verifyToken = require('../middlewares/verify-token'),
    isAdmin = require("../middlewares/is-admin"),
    responses = require('../middlewares/responses'),
    voiceCardController = require('../middlewares/controllers/voiceCard'),
    { createVoiceCard, deleteVoiceCard } = require('./functions/voiceCard'),
    otpGen = require("otp-generator"),
    decodeToken = require('../middlewares/decodeToken'),
    {
        giveNewPath,
        parseForm,
        putFile,
        mkdir,
        amrToMp3Function
    } = require('../routes/functions/uploadFunctions'),
    createQrCode = require('./functions/createQrCode'),
    { unlink } = require('../utils/fs')

// POST request - create a new voice-card
router.post('/voice-card', [voiceCardController, verifyToken], async (req, res) => {
    try {
        const voiceCard = await createVoiceCard(req, VoiceCard)
        res.json({
            status: true,
            message: "کارت صدا با موفقیت ذخیره شد",
            voiceCard
        });
    } catch (error) {
        responses(res, 500, [error.message || error])
    }
})

// POST request - create plenty of voice-cards
router.post('/voice-card/plenty', [voiceCardController, verifyToken, isAdmin], async (req, res) => {
    try {
        const quantity = Number(req.body.quantity)
        req.body.saleMethod = 'digi'
        // Voice Card ha be esme admin sakhte nashan
        delete req.decoded._id
        const pathes = []
        for (let index = 0; index < quantity; index++) {
            const otp = otpGen.generate(6, { upperCase: false, specialChars: false, alphabets: false })
            req.body.password = otp
            const vc = await createVoiceCard(req, VoiceCard)
            const path = __dirname + `/temp files//%${index}.png`
            const url = `https://B612theory.ir/remember-remember/${vc._id}?password=${otp}`
            await createQrCode(path, url)
            pathes.push(path)
        }
        // await generateVCs(voiceCards)
        const zipPath = __dirname + '/temp files//voice-cards.zip'
        await createZip(pathes, zipPath)
        await res.sendFile(zipPath)
        await unlink([zipPath])
        await unlink(pathes)
    } catch (error) {
        console.trace(error)
        responses(res, 500, [error.message || error])
    }
})

// GET request - get all voiceCards
router.get("/voice-card", [verifyToken, isAdmin], async (req, res) => {
    try {
        let voiceCards = await VoiceCard.find(req.query);
        responses(res, 200, ['کارت های صدا با موفقیت یافت شدند'], voiceCards)
    } catch (error) {
        responses(res, 500, [error.message || error])
    }
})

// GET request - get a single voice-card
router.get("/voice-card/:id", decodeToken, async (req, res) => {
    try {
        let voiceCard = await VoiceCard.findOne({ _id: req.params.id })
        if (!voiceCard) return responses(res, 404, ['کارت صدا وجود ندارد'])
        else if ((req.decoded && ['admin', 'super_admin'].includes(req.decoded.role)) || voiceCard.activated || voiceCard.comparePassword(req.query.password)) {
            responses(res, 200, ['کارت صدا'], voiceCard)
            !voiceCard.views ? voiceCard.views = 1 : voiceCard.views++
            voiceCard.ips.indexOf(req.ip) == -1 && voiceCard.ips.push(req.ip)
            await voiceCard.save()
        }
        else return responses(res, 403)
    } catch (error) {
        responses(res, 500, [error.message || error])
    }
})

// PUT request - update a single voiceCard
router.put("/voice-card/:id", [voiceCardController, verifyToken], async (req, res) => {
    try {
        let voiceCard = await VoiceCard.findOne({ _id: req.params.id });
        if (voiceCard.activated) {
            for (let key in req.body) {
                voiceCard[key] = req.body[key]
            }
            await voiceCard.save()
            return responses(res, 200, ["کارت صدا با موفقیت به‌روز شد."], voiceCard)
        }
        else return responses(res, 403)
    } catch (error) {
        return responses(res, 500, [error.message || error])
    }
})

// PUT request - update a single voiceCard from other saleMethods
router.put("/voice-card/plenty/:id", [decodeToken], async (req, res) => {
    try {
        let voiceCard = await VoiceCard.findOne({ _id: req.params.id });
        const { fields, files } = await parseForm(req)
        if ((req.decoded && ['admin', 'super_admin'].includes(req.decoded.role)) || voiceCard.comparePassword(fields.password)) {
            delete fields.password
            if (files && files.file) {
                delete fields.audio
                const { time, newPath } = giveNewPath()
                await mkdir(newPath)
                if (!files.file) return responses(res, 404, ['فایلی ارسال نشده است.'])

                let oldpath = files.file.path;

                const userId = (req.decoded && req.decoded._id) || req.ip
                let newFilePath = newPath + `/${userId}-${time}-${files.file.name}`

                if (['audio/amr'].includes(files.file.type)) {
                    oldpath = await amrToMp3Function(files.file, oldpath)
                    newFilePath = newFilePath.slice(0, newFilePath.length - 3) + 'mp3'
                }
                const url = await putFile(oldpath, newFilePath)
                voiceCard.audio = url
            }
            for (let key in fields) {
                voiceCard[key] = req.body[key]
            }
            await voiceCard.save()
            return responses(res, 200, ["کارت صدا با موفقیت به‌روز شد."], voiceCard)
        }
        else return responses(res, 403)
    } catch (error) {
        console.log(error);
        return responses(res, 500, [error.message || error])
    }
})

// DELETE request - delete a single voice-card
router.delete("/voice-card/:id", verifyToken, async (req, res) => {
    try {
        let voiceCard = await VoiceCard.findOne({ _id: req.params.id })
        if (!voiceCard) return responses(res, 202, [], voiceCard)
        if (['admin', 'super_admin'].indexOf(req.decoded.role) != -1 || JSON.stringify(voiceCard.user) == JSON.stringify(req.decoded._id)) {
            await deleteVoiceCard(voiceCard)
            return responses(res, 202, ['کارت صدا'], voiceCard)
        }
        return responses(res, 403)
    } catch (error) {
        return responses(res, 500, [error.message || error])
    }
})

module.exports = router;