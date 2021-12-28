const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

const Export = new Schema(
  {
    voiceCards: [{ type: Schema.Types.ObjectId, ref: 'VoiceCard' }],
    polaroids: [{ type: Schema.Types.ObjectId, ref: 'Polaroid' }],
    createdTime: { type: Date, default: Date.now },
  }
)

module.exports = mongoose.model("Export", Export);