const router = require('express').Router(),
    Category =require('../models/category'),
    verifyToken = require('../middlewares/verify-token'),
    isAdmin = require("../middlewares/is-admin"),
    responses   = require('../middlewares/responses')

// GET request

router.get("/categories", async(req, res) => {
    try {
        let categories = await Category.find(req.query);
        return responses(res,200,['دسته‌بندی ها با موفقیت ارسال شد'],categories)
    } catch (error) {
        responses(res,500,[error.message])
    }
})

router.get("/categories/:id", async(req, res) => {
    try {
        let categories = await Category.findOne({_id: req.params.id}).populate('products').exec() ;
        return responses(res,200,['دسته‌بندی و محصولات با موفقیت ارسال شدند'],categories)
    } catch (error) {
        responses(res,500,[error.message])
    }
})

// POST request

router.post('/categories', [verifyToken, isAdmin], async (req, res) => {
    try {
        const category = new Category();
        category.name = req.body.name;
        category.value = req.body.value;
        category.photos = req.body.photos 

        await category.save() ;
        res.json({
            success: true,
            message: "دسته بندی با موفقیت ذخیره شد"
        })
    } catch (err) {
    res.status(500).json({
        success: false,
        message: err.message
    })        
    }
})

// UPADTE request

router.put('/categories/:id', [verifyToken, isAdmin], async (req, res) => {
    try {
        let foundCategory = await Category.findOne({_id : req.body._id})
        if (foundCategory) {
            if (req.body.name) foundCategory.name = req.body.name.trim()
            if (req.body.value) foundCategory.value = req.body.value.trim()
            if (req.body.photos) foundCategory.photos = req.body.photos
            await foundCategory.save() ;
            res.json({
                success : true,
                message : "دسته‌بندی با موفقیت به روز شد"
            })
        } else {
            res.status(404).json({
                success: false,
                message: 'دسته‌بندی یافت نشد.'
            }) 
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })        
    }
})


// DELETE request

router.delete("/categories/:id", [verifyToken, isAdmin], async(req, res) => {
    try {
        let deletedCategory = await Category.deleteOne({_id : req.params.id})
        if (deletedCategory) {
            res.json({
                success : true,
                message : "دسته بندی با موفقیت حذف شد"
            })
        }
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        })
    }
})

module.exports = router;