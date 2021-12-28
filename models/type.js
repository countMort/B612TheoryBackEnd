const mongoose   = require('mongoose'),
        Schema   = mongoose.Schema ;

const TypeSchema = new Schema({
    product: {type: Schema.Types.ObjectId, ref: "Product"},
    name: {
        type: String, required: true
    },
    custom: {
        type : Boolean, default: false
    },
    description: String,
    photos: Array,
    thumbnails: Array,
    files: Array,
    price: Number,
    stockQuantity: {
        type: Number, required: true
    },
    dimensions: {
        type: String,
        trim: true
    },
})

module.exports = mongoose.model("Type", TypeSchema);