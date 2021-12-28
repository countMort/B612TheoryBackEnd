const router    = require('express').Router(),
    Review      = require('../models/review') ,
    verifyToken = require('../middlewares/verify-token'),
    Product     = require('../models/product')


    // age mikhay bishtar az 1 middleware estefade koni beyad bezarishoon too array
router.post('/reviews/:productID' ,verifyToken ,  async (req , res) => {
    try {
        const review = new Review() ;
        review.headline = req.body.headline.trim()
        review.body = req.body.body.trim()
        review.rating = req.body.rating
        // review.photo = req.body.photo
        review.user = req.decoded._id
        review.productID = req.params.productID

        await Product.updateOne({_id : review.productID},{$push: {reviews: review._id}})

        const savedReview = await review.save() ;
        
        if(savedReview) {
            res.json({
                success : true ,
                message: "Successfully Added Review" ,
            })
        }
    } catch (error) {
        res.status(500).json({
            success : false ,
            message : error.message
        })
    }
})

// get reviews

router.get('/reviews/:productID' , async (req , res) => {
    try {
        const productReviews = await Review.find({
            productID : req.params.productID
        })
        .populate("user")
        .exec() ;

        res.json({
            success : true ,
            reviews: productReviews ,
            message : "Successfully Populated Reviews"
        })
    } catch (error) {
        res.status(500).json({
            success : false ,
            message :error.message
        })
    }
})


router.delete('/reviews/:reviewID', verifyToken , async (req , res) => {
    try {
        let review = await Review.findOne({_id : req.params.reviewID})
        let userID = review.user
        if (JSON.stringify(req.decoded._id) === JSON.stringify(userID)) {
            let deletedReview = await Review.findOneAndDelete({_id : req.params.reviewID})
            if (deletedReview) {
                res.json({
                    success : true ,
                    message : "نظر با موفقیت حذف شد"
                })
            }
        }
    } catch (error) {
        res.status(500).json({
            success : false ,
            message : error.message
        })
    }
})

module.exports = router