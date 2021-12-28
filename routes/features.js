const router = require('express').Router(),
  { isAdmin } = require("../middlewares/auth"),
  Feature = require('../models/feature'),
  responses = require('../middlewares/responses')

router.get('/', isAdmin, async (req, res) => {
  try {
    const features = await Feature.find()
    return responses(res, 200, ['فیچر ها با موفقیت ارسال شدند'], features)
  } catch (error) {
    responses(res, 500, [error.message])
  }
})

router.get("/:id", async (req, res) => {
  try {
    const features = await Feature.findOne({ _id: req.params.id }).populate('products types').exec();
    return responses(res, 200, ['فیچر با موفقیت ارسال شد'], features)
  } catch (error) {
    responses(res, 500, [error.message])
  }
})

// POST request

router.post('/', isAdmin, async (req, res) => {
  try {
    const feature = new Feature();
    feature.name = req.body.name;
    feature.price = req.body.price;
    feature.stockQuantity = req.body.stockQuantity;
    feature.photos = req.body.photos
    feature.thumbnails = req.body.thumbnails
    feature.products = req.body.products
    feature.types = req.body.types
    feature.description = req.body.description

    await feature.save();
    res.json({
      success: true,
      message: "فیچر با موفقیت ایجاد شد",
      feature
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
})

// UPADTE request

router.put('/:id', isAdmin, async (req, res) => {
  try {
    const foundFeature = await Feature.findOne({ _id: req.body._id })
    if (foundFeature) {
      if (req.body.name) foundFeature.name = req.body.name.trim()
      if (req.body.description) foundFeature.description = req.body.description.trim()
      if (req.body.price) foundFeature.price = req.body.price
      if (req.body.stockQuantity) foundFeature.stockQuantity = req.body.stockQuantity
      if (req.body.photos) foundFeature.photos = req.body.photos
      if (req.body.thumbnails) foundFeature.thumbnails = req.body.thumbnails
      if (req.body.products) foundFeature.products = req.body.products
      if (req.body.types) foundFeature.types = req.body.types
      await foundFeature.save();
      res.json({
        success: true,
        message: "فیچر با موفقیت به روز شد",
        result: foundFeature
      })
    } else {
      res.status(404).json({
        success: false,
        message: 'فیچر یافت نشد.'
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

router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const deletedFeature = await Feature.deleteOne({ _id: req.params.id })
    if (deletedFeature) {
      res.json({
        success: true,
        message: "فیچر با موفقیت حذف شد"
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

module.exports = router;