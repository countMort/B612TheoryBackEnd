module.exports = (req, res, next) => {
    try {
        let body = {}
        let keys = {
            name: 'string',
            description: 'string',
            photos: 'array'
        }
        for(let key in req.body) {
            if (keys.hasOwnProperty(key)) {
                if (keys[key] != 'array') body[key] = req.body[key].trim()
                else {
                    if (Array.isArray(req.body.photos)) {
                        body.photos = req.body.photos
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