const mongoose  = require('mongoose'),
    Schema      = mongoose.Schema

var logs = Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User'},
    ip: { type: String, required: true },
    error: Object,
    message: String
});

module.exports = mongoose.model('Log', logs);