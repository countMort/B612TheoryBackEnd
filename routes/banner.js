const router = require('express').Router(),
    Banner =require('../models/banner'),
    Type =require('../models/type'),
    verifyToken = require('../middlewares/verify-token'),
    isAdmin = require("../middlewares/is-admin"),
    responses = require('../middlewares/responses')

// POST request - create a new banner
router.post('/banners', [verifyToken, isAdmin], async(req, res) => {
    try {
        let banner = new Banner();
        for(let key in req.body) {
            banner[key] = req.body[key]
        }
        await banner.save();
        return responses(res,200,["بنر با موفقیت ذخیره شد"],banner)
    } catch (error) {
        responses(res,500,[error.message || error])
    }
})

// GET request - get all banners

router.get("/banners",[verifyToken, isAdmin] , async(req, res) => {
    try {
        let banners = await Banner.find();
        return responses(res,200,[''],banners)
    } catch (error) {
        responses(res,500,[error.message || error])
    }
})

// GET request - get a single banner

router.get("/banners/:id" ,[verifyToken, isAdmin] , async(req, res) => {
    try {
        let banner = await Banner.findOne({ product : req.params.id});
        return responses(res,200,[''],banner)
    } catch (error) {
        responses(res,500,[error.message || error])
    }
})

// PUT request - update a single banner

router.put("/banners/:id", [verifyToken, isAdmin], async(req, res) => {
    try {
        let banner = await Banner.findOneAndUpdate(
            {
                _id : req.params.id
            }, 
            {
                $set: {
                    name: req.body.name.trim(),
                    price : req.body.price,
                    description : req.body.description.trim(),
                    photos : req.body.photos,
                    product : req.body.productID,
                }
            },
            {
                upsert: true
            }
        );
        return responses(res,200,['بنر با موفقیت بروز رسانی شد'],banner)
    } catch (error) {
        responses(res,500,[error.message || error]) 
    }
})

// DELETE request - delete a single product

router.delete("/banners/:id", [verifyToken, isAdmin], async (req, res) => {
    try {
        let deletedBanner = await Banner.findOneAndDelete({ _id : req.params.id})
        if (deletedBanner) {
            return responses(res,202,['بنر'],deletedBanner)
        }
    } catch (error) {
        responses(res,500,[error.message || error]) 
    }
})

module.exports = router;