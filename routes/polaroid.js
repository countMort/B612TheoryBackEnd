const router = require('express').Router(),
    Polaroid = require('../models/polaroid'),
    Order = require('../models/order'),
    verifyToken = require('../middlewares/verify-token'),
    isAdmin = require("../middlewares/is-admin"),
    deletePolaroid = require('./functions/deletePolaroid'),
    responses = require('../middlewares/responses')


// POST request - create a new polaroid
router.post('/polaroid', verifyToken, async (req, res) => {
    try {
        const polaroid = new Polaroid();
        polaroid.photo = req.body.photo
        polaroid.thumbnail = req.body.thumbnail
        polaroid.quote = req.body.quote
        polaroid.type = req.body.type
        polaroid.user = req.decoded._id
        await polaroid.save();
        res.json({
            status: true,
            message: "عکس پولاروید با موفقیت ذخیره شد",
            polaroid
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
})


// GET request - get all polaroids

router.get("/polaroid", [verifyToken, isAdmin], async (req, res) => {
    try {
        // const polaroids = await Polaroid.find().sort({createdTime: -1}).limit(300);
        const orders = await Order.find({ 'products.polaroid': { $exists: true} }).sort({createdTime: -1}).limit(50).populate('products.polaroid').exec()
        const result = orders.reduce((pv, cv) => {
            const pols = cv.products.map(pr => ({
                polaroid: pr.polaroid,
                order: cv
            }))
            .filter(pr => pr.polaroid)
            return [
                ...pv,
                ...pols
            ]
        }, [])
        res.json({
            success: true,
            data: result
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})


// GET request - get a single polaroid

router.get("/polaroid/:id", async (req, res) => {
    try {
        let polaroid = await Polaroid.findOne({ _id: req.params.id });
        res.json({
            success: true,
            polaroid
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})


// PUT request - update a single polaroid

router.put("/polaroid/:id", [verifyToken, isAdmin], async (req, res) => {
    try {
        let polaroid = await Polaroid.findOneAndUpdate(
            {
                _id: req.params.id
            },
            {
                $set: {
                    photo: req.body.photo,
                    thumbnail: req.body.thumbnail,
                    quote: req.body.quote,
                    type: req.body.type,
                }
            },
            // {
            //     upsert: true
            // }
        );
        res.json({
            success: true,
            updatedProduct: polaroid,
            message: "عکس پولاروید با موفقیت به‌روز شد."
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

// DELETE request - delete a single polaroid

router.delete("/polaroid/:id", verifyToken, async (req, res) => {
    try {
        let polaroid = await Polaroid.findOne({ _id: req.params.id })
        if (!polaroid) return responses(res, 202, [], polaroid)
        if (['admin', 'super_admin'].indexOf(req.decoded.role) != -1 || JSON.stringify(polaroid.user) == JSON.stringify(req.decoded._id)) {
            await deletePolaroid(polaroid)
            return responses(res, 202, ['عکس پولاروید'], polaroid)
        }
        return responses(res, 403)
    } catch (error) {
        return responses(res, 500, [error.message || error])
    }
})


module.exports = router;