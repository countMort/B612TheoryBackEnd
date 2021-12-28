module.exports = (req, res, next) => {
    try {
        let body = {}
        let keys = {
            qrNumber: 'string',
            audio: 'string',
            photo: 'string',
            waveColor: 'string',
            type: 'string',
            user: 'string',
            password: 'string',
            quantity: 'string',
            saleMethod: 'string',
            thumbnail: 'string'
        }
        for(let key in req.body) {
            if (keys.hasOwnProperty(key)) {
                if (keys[key] != 'array' && typeof  req.body[key] == keys[key]) body[key] = req.body[key].trim()
                else {
                    if (Array.isArray(req.body[key])) {
                        body[key] = req.body[key]
                    }
                }
            }
        }
        req.body = body
        next()
    } catch (error) {
        next(error)
    }
}