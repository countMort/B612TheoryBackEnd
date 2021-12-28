const mongoose  = require('mongoose'),
    Schema      = mongoose.Schema

var counterSchema = Schema({
    _id: { "type": String, "required": true },
    seq: { "type": Number, "default": 61200000 }
});

module.exports = mongoose.model('Counter', counterSchema);