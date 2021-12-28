const mongoose   = require('mongoose'),
        Schema   = mongoose.Schema ;

const bannerSchema = new Schema({
    name: String,
    description: String,
    types: [
        {
            type: Schema.Types.ObjectId, ref: "Type"
        }
    ],
    sort: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model("Banner", bannerSchema);