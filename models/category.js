const mongoose   = require('mongoose'),
        Schema   = mongoose.Schema ;

const CategorySchema = new Schema({
    name: { type: String, unique: true, required: true, trim: true },
    value: { type: String, unique: true, required: true, trim: true },
    photos : Array,
    thumbnails: Array,
    products: [
        {
            type: Schema.Types.ObjectId, ref: 'Product'
        }
    ],
    display: String,
})

module.exports = mongoose.model("Category", CategorySchema);