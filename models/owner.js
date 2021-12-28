const mongoose   = require('mongoose') ,
        Schema   = mongoose.Schema ;



const OwnerSchema = new Schema({
    name: String ,
    description: String ,
    photo: String ,
    address: {type: Schema.Types.ObjectId , ref: "Address" } ,
    phone : Number ,
})

module.exports = mongoose.model("Owner" , OwnerSchema);