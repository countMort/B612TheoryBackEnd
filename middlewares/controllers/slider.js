module.exports = (req, res, next) => {
    try {
        let body = {}
        let keys = {
            name: 'string',
            description: 'string',
            photos: 'array',
            sort: 'string',
            products: 'array',
            types: 'array',
            categories: 'array',
            type: 'string'
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