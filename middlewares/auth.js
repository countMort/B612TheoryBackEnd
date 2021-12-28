const jwt = require('jsonwebtoken')

function decodeToken(req, res, next) {
    let token = getToken(req)
    if(token) {
        req.decoded = decode(token).decoded
    }
    next()
}

function verifyToken(req, res, next) {
    let token = getToken(req)
    if(token) {
        const data = decode(token)
        if (!data.success) return res.json(data)
        else {
            req.decoded = data.decoded ;
            if (next) return next() ;
        }
    } else {
        return res.status(401).json({
            success : false ,
            message : "لطفا وارد حساب کاربری خود شوید"
        })
    }
}

function isAdmin(req, res, next) {
    verifyToken(req, res)
    if (["super_admin", "admin"].includes(req.decoded.role)) {
        next()
    } else {
        res.status(403).json({
            success: false ,
            message: "forbidden"
        })
    }
}

module.exports = {
    decodeToken,
    verifyToken,
    isAdmin
}

function getToken(req) {
    return req.headers['x-access-token'] || req.headers["authorization"]
}

function decode (token) {
    let checkBearer = "Bearer "
    if(token.startsWith(checkBearer)) {
        token = token.slice(checkBearer.length , token.length)
    }
    return jwt.verify(token , process.env.SECRET , (err , decoded) => {
        if (!err) return {
            success: true,
            decoded
        };
        else return {
            success : false ,
            message : "Failed to authenticate"
        }
    })
}