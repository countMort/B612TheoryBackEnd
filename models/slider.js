const mongoose   = require('mongoose'),
        Schema   = mongoose.Schema;

const sliderSchema = new Schema({
    name: String,
    description: String,
    sort: {type: Number, required: true},
    type: String,
    slides: [
        {
            photo: String,
            link: String,
            alt: String,
            sort: {type: Number, default: 1},
        }
    ],
    types: [{type: Schema.Types.ObjectId, ref: 'Type'}],
    products: [{type: Schema.Types.ObjectId, ref: 'Product'}],
    categories: [{type: Schema.Types.ObjectId, ref: 'Category'}],
})

module.exports = mongoose.model("Slider", sliderSchema);