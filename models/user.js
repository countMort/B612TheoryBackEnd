const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require("bcrypt-nodejs")

const UserSchema = new Schema({
    name : {
        type: String,
        trim: true
    },
    phone: {type: Number, unique: true, required: true },
    password: {type: String, required: true},
    address: {type: Schema.Types.ObjectId, ref: "Address"} ,
    role: {type: String, default: "user"},
    createdTime: {type: Date, default: Date.now}
})

UserSchema.pre("save", function(next) {
    let user = this
    if (this.isModified('password') || this.isNew ) {
        bcrypt.genSalt(10, function(err, salt) {
            if (err) {
                return next(err)
            }
            bcrypt.hash(user.password, salt, null, function(err, hash) {
                if(err) {
                    return next(err)
                }
                user.password = hash
                next();
            })
        })
    } else {
        return next();
    }
})

UserSchema.methods.comparePassword = function(password, next) {
    let user = this;
    return bcrypt.compareSync(password, user.password)
}

module.exports = mongoose.model("User", UserSchema);