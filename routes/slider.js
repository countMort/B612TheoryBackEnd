const router = require('express').Router(),
    Slider =require('../models/slider'),
    Type =require('../models/type'),
    verifyToken = require('../middlewares/verify-token'),
    isAdmin = require("../middlewares/is-admin"),
    responses = require('../middlewares/responses'),
    sliderController   = require('../middlewares/controllers/slider')

// POST request - create a new slider
router.post('/sliders', [sliderController, verifyToken, isAdmin], async(req, res) => {
    try {
        let slider = new Slider();
        for(let key in req.body) {
            slider[key] = req.body[key]
        }
        await slider.save();
        return responses(res,200,["اسلایدر با موفقیت ذخیره شد"],slider)
    } catch (error) {
        responses(res,500,[error.message || error])
    }
})

// GET request - get all sliders
router.get("/sliders" , async(req, res) => {
    try {
        let sliders = await Slider.find({},{}, {sort: {sort: 1}}).populate('products types categories').exec();
        return responses(res,200,[''],sliders)
    } catch (error) {
        responses(res,500,[error.message || error])
    }
})

// GET request - get a single slider
router.get("/sliders/:id"  , async(req, res) => {
    try {
        let slider = await Slider.findOne({ _id: req.params.id}).populate('products types categories').exec();
        return responses(res,200,[''],slider)
    } catch (error) {
        responses(res,500,[error.message || error])
    }
})

// PUT request - update a single slider
router.put("/sliders/:id", [sliderController, verifyToken, isAdmin], async(req, res) => {
    try {
        // let slider = await Slider.findOneAndUpdate(
        //     {
        //         _id: req.params.id
        //     },
        //     {
        //         $set: {
        //             name: req.body.name.trim(),
        //             photos: req.body.photos,
        //             description: req.body.description.trim(),
        //             sort: req.body.sort
        //         }
        //     },
        //     {
        //         upsert: true
        //     }
        // );
        let slider = await Slider.findOne({_id: req.params.id})
        for (const key in req.body) {
            if (Object.hasOwnProperty.call(req.body, key)) {
                slider[key] = req.body[key]
            }
        }
        await slider.save()
        return responses(res,200,['اسلایدر با موفقیت بروز رسانی شد'],slider)
    } catch (error) {
        responses(res,500,[error.message || error]) 
    }
})

// DELETE request - delete a single product
router.delete("/sliders/:id", [verifyToken, isAdmin], async (req, res) => {
    try {
        let deletedSlider = await Slider.findOneAndDelete({ _id: req.params.id})
        if (deletedSlider) {
            return responses(res,202,['اسلایدر'],deletedSlider)
        }
    } catch (error) {
        responses(res,500,[error.message || error]) 
    }
})

module.exports = router;