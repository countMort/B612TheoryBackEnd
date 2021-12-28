const mongoose   = require('mongoose'),
        Schema   = mongoose.Schema ;

const Feature = new Schema(
    {
        name: { type: String, trim: true },
        description: { type: String, trim: true },
        photos: Array,
        thumbnails: Array,
        price: Number,
        stockQuantity: {type: Number, required: true},
        products: [ { type: Schema.Types.ObjectId, ref: "Product" } ],
        types: [ { type: Schema.Types.ObjectId, ref: "Type" } ],
    }
)

module.exports = mongoose.model("Feature", Feature);