const mongoose = require("mongoose"),
  Schema = mongoose.Schema

const offScheme = {
  title: { type: String, trim: true },
  code: String,
  offType: {
    type: String,
    default: "percentage",
  },
  percentageOff: Number,
  constantOff: Number,
  maximumOff: Number,
  shipmentOff: Number,
  conditionalOff: Boolean,
  leastAmount: Number,
  leastCost: Number,
  maxUsage: Number,
  usageLeft: Number,
  usagePerUser: Number,
  usersList: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
    },
  ],
  activationDate: Date,
  expirationDate: Date,
}
const Off = new Schema(offScheme)

module.exports = {
  Off: mongoose.model("Off", Off),
  offScheme,
}
