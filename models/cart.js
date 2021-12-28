const mongoose   = require('mongoose'),
        Schema   = mongoose.Schema ;

const Cart = new Schema(
    {
        description: {type: String, trim: true},
        photos: Array,
        price: Number,
        stockQuantity: {type: Number, required: true},
        product: [{ type: Schema.Types.ObjectId, ref: "Product"}],
    }
)

module.exports = mongoose.model("Cart", Cart);