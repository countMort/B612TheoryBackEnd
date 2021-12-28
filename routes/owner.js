const router = require('express').Router() ,
    Owner =require('../models/owner')

// POST request 
router.post('/owners' , async(req , res) => {
    try {
        let owner = new Owner() ;
        owner.name = req.body.name ;
        owner.description = req.body.description ;
        owner.phone = req.body.phone ;
        owner.photo = req.body.photo ;
        await owner.save()

        res.json({
            success : true ,
            message : "Successfuly Created the Owner"
        })
    } catch (error) {
        res.status(500).json({
            success : false ,
            message : error.message
        })
    }
})

// GET request

router.get("/owners" , async(req , res) => {
    try {
        let owners = await Owner.find() ;
        res.json({
            success : true ,
            owners : owners
        })
    } catch (error) {
        res.status(500).json({
            success: false ,
            message: error.message
        })  
    }
})

module.exports = router ;