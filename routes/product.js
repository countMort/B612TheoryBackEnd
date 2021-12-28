const router = require('express').Router(),
    Product = require('../models/product'),
    verifyToken = require('../middlewares/verify-token'),
    isAdmin = require("../middlewares/is-admin"),
    Type = require('../models/type'),
    Category = require('../models/category'),
    responses = require('../middlewares/responses')

// POST request - create a new product
router.post('/products', [verifyToken, isAdmin], async (req, res) => {
    try {
        let product = new Product();
        let category = Category.findOne({ _id: req.body.categoryID })
        if (!category) return responses(res, 404, ['دسته‌بندی'])
        if (!product) return responses(res, 404, ['محصول'])
        product.name = req.body.name.trim()
        product.description = req.body.description.trim()
        product.photos = req.body.photos
        product.stockQuantity = req.body.stockQuantity
        // product.owner =req.body.ownerID
        product.category = req.body.categoryID
        product.price = req.body.price
        const types = req.body.types
        if (types) {
            for (let index = 0; index < types.length; index++) {
                let type = new Type();
                for (const key in types[index]) {
                    type[key] = types[index][key]
                }
                type.product = product.id
                await type.save()
                product.types.push(type._id)
            }
        }
        await product.save();
        return responses(res, 201, ['محصول'], product)
    } catch (error) {
        responses(res, 500, [error.message])
    }
})

// GET request - get all products
router.get("/admin/products", async (req, res) => {
    try {
        let result
        if (req.query.name) {
            result = await Product.findOne({ name: req.query.name }).populate("category types").populate('reviews', 'rating').exec();
            if (result) return responses(res, 200, ['محصول'], result)
        } else {
            result = await Product.find({}).populate("category types").populate('reviews', 'rating').exec();
            if (result) return responses(res, 200, ['محصولات'], result)
        }
        return responses(res, 404, ['محصولی'])
    } catch (error) {
        responses(res, 500, [error.message])
    }
})

router.get("/products", async (req, res) => {
    try {
        let result
        if (req.query.name) {
            result = await Product.findOne({ name: req.query.name }, { types: 0 }).populate("category", "name value").populate('reviews', 'rating').exec();
            if (result) return responses(res, 200, ['محصول'], result)
        } else {
            result = await Product.find({}, { types: 0 }).populate("category", "name value").populate('reviews', 'rating').exec();
            if (result) return responses(res, 200, ['محصولات'], result)
        }
        return responses(res, 404, ['محصولی'])
    } catch (error) {
        responses(res, 500, [error.message])
    }
})

// GET request - get a single product
router.get("/products/:id", async (req, res) => {
    try {
        let product = await Product.findOne({ _id: req.params.id }).populate("category types").populate('reviews', 'rating').exec();
        if (!product) product = await Product.findOne({ 'types': req.params.id }).populate("category types").populate('reviews', 'rating').exec();
        if (!product) return responses(res, 404, ['محصولی'])
        return responses(res, 200, ['محصولات', 'نوع ها'], {
            product, type: product.types.find(type => type._id == req.params.id)
        })
    } catch (error) {
        responses(res, 500, [error.message || error])
    }
})

// PUT request - update a single product
router.put("/products/:id", [verifyToken, isAdmin], async (req, res) => {
    try {
        let product = await Product.findOne({
            _id: req.params.id
        })
        product.name = req.body.name
        product.price = req.body.price
        product.description = req.body.description
        product.photos = req.body.photos
        product.category = req.body.categoryID
        product.stockQuantity = req.body.stockQuantity
        const types = req.body.types
        // console.log('body types: ', types);
        // console.log('product.types: ', product.types);
        if (types) {
            // oonayi ke hazf shodan ro haminja pak kone az product (fek konam!)
            product.types = product.types.filter(productType => {
                return types.find(type => JSON.stringify(type._id) == JSON.stringify(productType))
            })
            // console.log('product.types: ', product.types);
            for (let index = 0; index < types.length; index++) {
                let type;
                if (types[index]._id) {
                    type = await Type.findOne({
                        _id: types[index]._id
                    });
                }
                if (!type) {
                    type = new Type();
                    product.types.push(type._id)
                }
                for (const key in types[index]) {
                    type[key] = types[index][key]
                }
                await type.save()
            }
        }
        await product.save()
        // let product = await Product.findOneAndUpdate(
        //     { 
        //         _id : req.params.id
        //     },
        //     {
        //         $set: {
        //             name: req.body.name.trim(),
        //             price : req.body.price,
        //             description : req.body.description.trim(),
        //             photos : req.body.photos,
        //             // owner: req.body.ownerID,
        //             category : req.body.categoryID,
        //             types: req.body.types
        //         }
        //     }
        // );
        return responses(res, 200, ['محصول با موفقیت بروزرسانی شد'], { product })
    } catch (error) {
        responses(res, 500, [error.message])
    }
})

// DELETE request - delete a single product
router.delete("/products/:id", [verifyToken, isAdmin], async (req, res) => {
    try {
        let deletedProduct = await Product.findOneAndDelete({ _id: req.params.id })
        if (deletedProduct) {
            return responses(res, 202, ['محصول'])
        } else {
            return responses(res, 404, ['محصولی'])
        }
    } catch (error) {
        responses(res, 500, [error.message])
    }
})

module.exports = router;