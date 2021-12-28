const router = require('express').Router(),
    decodeToken = require('../middlewares/decodeToken'),
    Log         = require('../models/logs')


router.post('/logs', decodeToken, async (req, res) => {
    try {
        let log = new Log()
        if (req.decoded) log.user = req.decoded._id
        log.ip = req.ip
        if (typeof req.body.error == 'object') {
            log.error = req.body.error
            log.message = req.body.error.message 
        } else {
            log.message = req.body.error
        }
        await log.save()
    } catch (error) {
        console.log(error);
    }
})

module.exports = router