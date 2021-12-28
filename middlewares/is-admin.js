module.exports = (req , res , next) => {
    try {
        if (req.decoded.role === "admin" || req.decoded.role === "super_admin") {
            next()
        } else {
            res.status(403).json({
                success: false ,
                message: "forbidden"
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false ,
            message: error.message
        })
    }
}