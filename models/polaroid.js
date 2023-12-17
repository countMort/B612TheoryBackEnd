const mongoose = require("mongoose"),
  Schema = mongoose.Schema

const Polaroid = new Schema({
  type: { type: Schema.Types.ObjectId, ref: "Type", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  photo: {
    type: String,
    required: true,
  },
  quote: {
    type: String,
    trim: true,
  },
  thumbnail: String,
  createdTime: { type: Date, default: Date.now },
  exported: Boolean,
  status: { type: String, default: "active" },
})

module.exports = mongoose.model("Polaroid", Polaroid)
