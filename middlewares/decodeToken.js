const jwt = require('jsonwebtoken')

module.exports = function(req , res , next) {
    let token = req.headers['x-access-token'] || req.headers["authorization"]
    let checkBearer = "Bearer "

    if(token) {
        if(token.startsWith(checkBearer)) {
            token = token.slice(checkBearer.length , token.length)
        }
        jwt.verify(token , process.env.SECRET , (err , decoded) => {
            if (!err) req.decoded = decoded ;
        })
    }
    next()
}