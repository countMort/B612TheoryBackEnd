const   router      = require('express').Router(),
        User        = require('../models/user'),
        jwt         = require('jsonwebtoken'),
        verifyToken = require('../middlewares/verify-token'),
        isAdmin     = require("../middlewares/is-admin"),
        rateLimit   = require("express-rate-limit"),
        { otpGenerator, otpValidator }= require("../utils/otp"),
        responses    = require('../middlewares/responses')

const sendCodeLimiter = rateLimit({
    windowMs : 15 * 60 * 1000, //15 mins
    max: 5,
    message: {
        message: "تعداد درخواست های پیامک بیش از حد مجاز در 15 دقیقه بود، لطفا بعدا تلاش کنید.",
        success: false
    }
})
// generate key
router.post("/auth/generate-key",sendCodeLimiter, async (req, res) => {
    try {
        let phone = req.body.phone;
        let foundUser = await User.findOne({phone});
        if (foundUser && !req.body.forgorPassword && foundUser.phone != req.body.phone) {
            return responses(res,403,['شماره تلفن از قبل ثبت شده است'])
        } else {
            let hash = await otpGenerator(phone)
            return responses(res,200,['کد تایید برای شما ارسال شد'], {hash})
        }
    } catch (error) {
        responses(res,500,[error.message])
    }
})

// Signup route
router.post('/auth/signup', async (req, res) => {
    try {
        if(!req.body.phone || !req.body.password) {
            return res.status(400).json({
                success : false,
                message : "لطفا شماره تلفن و رمز را وارد نمایید"
            })
        }
        else if (!otpValidator(req.body.phone,req.body.otp,req.body.hash)) {
            return res.status(401).json({
                success : false,
                message : "کد تایید وارده اشتباه است"
            })
        }
        else {
            let newUser = new User();
            newUser.name = req.body.name.trim();
            newUser.phone = req.body.phone;
            newUser.password = req.body.password;
            await newUser.save();
            let token = jwt.sign(newUser.toJSON(), process.env.SECRET, {
                expiresIn: 604800 // 1 week
            })
            return res.json({
                success : true,
                token : token,
                user : newUser,
                message : "حساب شما با موفقیت ساخته شد"
            })
        }
    } catch (error) {
        responses(res,500,[error.message])
    }
})

// Profile route
router.get("/auth/user", verifyToken, async(req, res) => {
    try {
        let foundUser = await User.findOne({_id: req.decoded._id} ).populate('address').exec();
        if (foundUser) {
            return res.json({
                success : true,
                user : foundUser
            })
        }
    } catch (error) {
        responses(res,500,[error.message])
    }
})

// Profile update route
router.put('/auth/user', verifyToken, async(req, res)=> {
    try {
        let foundUser = await User.findOne({_id : req.decoded._id})
        if (foundUser) {
            if (req.body.name) foundUser.name = req.body.name.trim()
            if (req.body.password) {
                if (foundUser.comparePassword(req.body.oldPassword)) {
                    foundUser.password = req.body.password
                    await foundUser.save()
                    return res.json({
                        message: "رمز با موفقیت تغییر کرد.",
                        success: true
                    })
                } else {
                    return res.status(401).json({
                        message: "رمز وارد شده اشتباه است",
                        success: false
                    })
                }
            } else if (req.body.phone) {
                let user = await User.findOne({phone: req.body.phone})
                if (!user) {
                    if (req.body.hash && req.body.otp) {
                        if (otpValidator(req.body.phone,req.body.otp,req.body.hash)) {
                            foundUser.phone = req.body.phone
                            await foundUser.save()
                        } else {
                            return res.status(401).json({
                                success : false,
                                message : "کد تایید وارده اشتباه است"
                            })
                        }
                    } else {
                        return res.status(500).json({
                            message: "اطلاعات کافی نیست",
                            success: false
                        })
                    }
                } else {
                    return res.status(403).json({
                        message: "کاربر با این شماره تلفن وجود دارد",
                        success: false
                    })
                }
            }
            await foundUser.save();
            return res.json({
                success : true,
                message : "با موفقیت به روز شد"
            })
        }
    } catch (error) {
        console.log(error);
        responses(res,500,[error.message || error])
    }
})

// Password Reset
router.put("/auth/user/reset-password", async (req, res) => {
    try {
        let user = await User.findOne({phone: req.body.phone})
        if (!user) return responses(res, 404, ['شماره تلفن یافت نشد'])
        if (otpValidator(req.body.phone,req.body.otp,req.body.hash)) {
            user.password = req.body.password
            await user.save()
            return responses(res, 200, ['رمز شما با موفقیت به روز رسانی شد.'])
        }
        else return responses(res, 403, ['کد ارسالی اشتباه است'])
    } catch (error) {
        console.log(error);
        responses(res,500,[error.message || error])
    }
})

// Login route
router.post("/auth/login",async (req, res) => {
    try {
        let foundUser = await User.findOne({phone : req.body.phone})
        if(!foundUser) {
            return res.status(404).json({
                success : false,
                message : "ورود انجام نشد ، کاربرد وجود ندارد!"
            })
        } else {
            if (foundUser.comparePassword(req.body.password)) {
                let token = jwt.sign(foundUser.toJSON(), process.env.SECRET, {
                    expiresIn : 6048000 // 10 week
                })
                return res.json({
                    success : true,
                    token : token,
                    message : "خوش آمدید"
                })
            } else {
                return res.status(403).json({
                    success : false,
                    message : "ورود انجام نشد ، رمز اشتباه!"
                })
            }
        }
    } catch (error) {
        responses(res,500,[error.message])
    }
})

// Logout route
router.post("/auth/logout", verifyToken,async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "با موفقیت خارج شدید"
        })
    } catch (error) {
        responses(res,500,[error.message])
    }
})

// DELETE user
router.delete("/auth/user/:id", [verifyToken, isAdmin], async(req, res) => {
    try {
        let deletedUser = await User.deleteOne({_id : req.params._id})
        if (deletedUser) {
            return res.json({
                success : true,
                message : "کاربر با موفقیت حذف شد"
            })
        }
    } catch (error) {
        responses(res,500,[error.message])
    }
})

module.exports = router;