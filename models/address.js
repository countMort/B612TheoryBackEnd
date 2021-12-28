const mongoose   = require('mongoose'),
        Schema   = mongoose.Schema ;



const AddressSchema = new Schema({
    user : {type : Schema.Types.ObjectId, ref : "User"},
    city : {type: String, required: true},
    fullName : {type: String, trim: true},
    firstName : {type: String, required: true, trim: true},
    lastName : {type: String, required: true, trim: true},
    streetAddress : {type: String, required: true, trim: true},
    province : {type: String, required: true},
    zipCode : {type: Number, required: true},
    phoneNumber : {type: Number, required: true},
    deliverInstructions : String,
})

AddressSchema.pre('save', function (next) {
    if (this.isModified('firstName') || this.isModified('lastName') || this.isNew) 
        this.fullName = this.firstName + ' ' + this.lastName
    next()
})

module.exports = mongoose.model("Address", AddressSchema);