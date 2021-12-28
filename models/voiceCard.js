const mongoose   = require('mongoose'),
        Schema   = mongoose.Schema,
        bcrypt = require("bcrypt-nodejs")

const VoiceCard = new Schema(
    {
        type: {type: Schema.Types.ObjectId, ref: "Type", required: true},
        user: {type: Schema.Types.ObjectId, ref: 'User'},
        photo: String,
        thumbnail: String,
        audio: String,
        qrNumber: {type: Number, default: 1},
        waveColor: {type: String, default: '#000000'},
        createdTime : {type: Date, default: Date.now},
        password: {type: String,},
        views: {type: Number, default: 0},
        activated: Boolean,
        ips: [String],
        saleMethod: String,
        exported: Boolean
    },
)

VoiceCard.pre("save", function(next) {
    let doc = this
    if (this.isModified('password') || this.isNew ) {
        bcrypt.genSalt(10, function(err, salt) {
            if (err) {
                return next(err)
            }
            bcrypt.hash(doc.password, salt, null, function(err, hash) {
                if(err) {
                    return next(err)
                }
                doc.password = hash
                next();
            })
        })
    } else {
        return next();
    }
})

VoiceCard.methods.comparePassword = function(password, next) {
    let doc = this;
    return bcrypt.compareSync(password, doc.password)
}

module.exports = mongoose.model("VoiceCard", VoiceCard);