const router    = require('express').Router() ,
    Address     = require('../models/address'),
    verifyToken = require('../middlewares/verify-token'),
    User        = require('../models/user')

router.post('/addresses' , verifyToken , async (req , res) => {
    try {
        let address = new Address() ;
        address.user = req.decoded._id
        address.city = req.body.city
        address.firstName = req.body.firstName.trim()
        address.lastName = req.body.lastName.trim()
        address.streetAddress = req.body.streetAddress.trim()
        address.province = req.body.province
        address.zipCode = req.body.zipCode
        address.phoneNumber = req.body.phoneNumber
        address.deliverInstructions = req.body.deliverInstructions.trim()
        let addedAddress = address.save()
        let user = User.findOne({_id : req.decoded._id}).populate('address').exec()
        const [addressResponse , foundUser] = await Promise.all([
            addedAddress ,
            user
        ])
        if (!foundUser.address) {
            foundUser.address = addressResponse._id
            await foundUser.save() ;
        }
        res.json({
            success : true ,
            message : "آدرس با موفقیت اضافه شد" ,
        })
    } catch (error) {
        res.status(500).json({
            success : false ,
            message : error.message
        })
    }
})

router.get('/addresses' , verifyToken , async (req , res) => {
    try {
        let addresses = await Address.find({user : req.decoded._id})
        res.json({
            success : true,
            addresses : addresses
        })
    } catch (error) {
        res.status(500).json({
            success : false ,
            message : error.message
        })
    }
})

router.get('/addresses/:id' , verifyToken , async (req , res) =>{
    try {
        let address = await Address.findOne({user : req.decoded._id , _id : req.params.id})
        res.json({
            success : true,
            address : address
        })
    } catch (error) {
        res.status(500).json({
            success : false ,
            message : error.message
        })
    }
})

// updating an address
router.put('/addresses/:id' , verifyToken , async (req , res) => {
    try {
        let address = await Address.findOne({user : req.decoded._id , _id : req.params.id }) ;
        if (address) {
            if(req.body.city) address.city = req.body.city
            if(req.body.firstName) address.firstName = req.body.firstName.trim()
            if(req.body.lastName) address.lastName = req.body.lastName.trim()
            if(req.body.streetAddress) address.streetAddress = req.body.streetAddress.trim()
            if(req.body.province) address.province = req.body.province
            if(req.body.zipCode) address.zipCode = req.body.zipCode
            if(req.body.phoneNumber) address.phoneNumber = req.body.phoneNumber
            address.deliverInstructions = req.body.deliverInstructions.trim()
        }
        await address.save()
        res.json({
            success : true ,
            message : "آدرس با موفقیت به روز شد"
        })
    } catch (error) {
        res.status(500).json({
            success: false ,
            message: error.message
        }) 
    }
})

router.delete('/addresses/:id' , verifyToken , async (req , res) => {
    try {
        let address = Address.deleteOne({user : req.decoded._id , _id : req.params.id})
        let user = User.findOne({ _id : req.decoded._id})
        const [deletedAddress , foundUser] = await Promise.all([
            address ,
            user
        ])
        if (JSON.stringify(deletedAddress.id) == JSON.stringify(foundUser.address)) {
            foundUser.address = null
            await foundUser.save()
        }
        if (deletedAddress) {
            res.json({
                success : true ,
                message : "آدرس با موفقیت حذف شد"
            })
        }
    } catch (error) {
        res.status(500).json({
            success : false ,
            message : error.message
        })
    }
})

// changing the default address
router.put('/addresses/set/default' , verifyToken , async (req , res) => {
    try {
        const doc = await User.findOneAndUpdate({_id : req.decoded._id} , {$set : { address : req.body.id }}) ;
        if(doc) {
            res.json({
                success : true ,
                message : "آدرس با موفقیت به عنوان آدرس پیش فرض لحاظ شد"
            })
        }
    } catch (error) {
        res.status(500).json({
            success : false ,
            message : error.message
        })
    }
})

module.exports = router;