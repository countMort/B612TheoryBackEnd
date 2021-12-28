const mongoose  = require('mongoose'),
    Schema      = mongoose.Schema,
    Counter     = require('../models/counter')

const OrderSchema = new Schema({
    user : {type: Schema.Types.ObjectId, ref: "User"},
    products: [
        {
            product: {type: Schema.Types.ObjectId, ref:"Product"},
            type: {type: Schema.Types.ObjectId, ref:"Type"},
            files: Array,
            photos: Array,
            quantity: Number,
            price : Number,
            name : String,
            custom: Boolean,
            polaroid: {type: Schema.Types.ObjectId, ref: "Polaroid"},
            voiceCard: {type: Schema.Types.ObjectId, ref: "VoiceCard"},
            diaryBook: {type: Schema.Types.ObjectId, ref: "DiaryBook"},
            category: {type: Schema.Types.ObjectId, ref: "Category"}
        }
    ],
    status: {type: String, default: 'empty'},
    paymentCode: Number,
    paymentDate: Date,
    paymentCard: Number,
    postCode: String,
    shipment: Object,
    estimatedDelivery : String,
    totalPrice : Number,
    createdTime : {type: Date, default: Date.now},
    deliverTo : {type: Object, required: true},
    trackingCode: {"type": Number, unique: true},
    note: {type: String, trim: true}
})

OrderSchema.pre("save", function (next) {
    let doc = this;
    let totalPrice = 0;
    this.products.forEach(product => {
        totalPrice += product.quantity * product.price
    });
    this.totalPrice = totalPrice + this.shipment.price
    if (!doc.trackingCode) {
        Counter.findOneAndUpdate(
            { "_id": "trackingCode" }, 
            { "$inc": { "seq": 1 } }
        , function(error, counter) {
            if(error) return next(error);
            doc.trackingCode = counter.seq;
            next();
        });
    } else {
        next()
    }
});

module.exports= mongoose.model("Order", OrderSchema)