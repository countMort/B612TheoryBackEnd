const mongoose = require('mongoose'),
  Schema = mongoose.Schema

const CustomMatch = new Schema({
  type: { type: Schema.Types.ObjectId, ref: 'Type', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  photos: Object,
  xOffsets: Object,
  yOffsets: Object,
  createdTime: { type: Date, default: Date.now },
  exported: Boolean,
})

module.exports = mongoose.model('CustomMatch', CustomMatch)
