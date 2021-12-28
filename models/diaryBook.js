const mongoose   = require('mongoose') ,
        Schema   = mongoose.Schema ;

const DiaryBook = new Schema(
    {
        type: { type: Schema.Types.ObjectId, ref: "Type", required: true},
        user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        photos: Object,
        video: String,
        quote: {type: String, trim: true},
        createdTime : {type: Date , default: Date.now},
        exported: Boolean
    } ,
)

module.exports = mongoose.model("DiaryBook" , DiaryBook);