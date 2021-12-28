const mongoose   = require('mongoose') ,
        Schema   = mongoose.Schema ;



const ReviewSchema = new Schema({
    headline : {
        type: String,
        trim: true
    } ,
    body : {
        type: String,
        trim: true
    } ,
    rating : Number ,
    photo : String ,
    productID : { type: Schema.Types.ObjectId , ref: "Product"},
    user : {type : Schema.Types.ObjectId , ref: "User"} ,
    verified: {type: Boolean , default: false}
})

module.exports = mongoose.model("Review" , ReviewSchema);