const dotenv= require('dotenv'),
otpGen      = require("otp-generator"),
otpTool     = require("otp-without-db"),
sms         = require('./sms')
dotenv.config() ;
const key   = process.env.SECRET; // Use unique key and keep it secret

function otpGenerator (phone) {
    return new Promise((resolve, reject) => {
        let otp   = otpGen.generate(6, { upperCase: false, specialChars: false, alphabets: false });
        let hash = otpTool.createNewOTP(phone,otp,key,expiresAfter=30,algorithm="sha256"); //Algorithm used for hashing the data. Any supported algorithm from OpenSSL
        sms('otp',phone, {code: otp})
        .then((result) => {
            resolve(hash)
        }).catch((err) => {
            reject(err)
        });
    })
}

function otpValidator (phone, otp, hash) {
    return otpTool.verifyOTP(phone,otp,hash,key,algorithm="sha256")
}

module.exports = {
    otpGenerator,
    otpValidator
}