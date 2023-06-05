const axios = require("axios")

function SMS(job, phone, inputData) {
  return new Promise((resolve, reject) => {
    let patternCode
    if (job == "otp") patternCode = "oud6nfy7lw"
    else if (job == "creating") patternCode = "wewqtzmav2"
    else if (job == "posted") patternCode = "0lflzjj2xs"
    else if (job == "reject") patternCode = "5jzsfqdiud"

    const data = {
      op: "pattern",
      user: "09038534333",
      pass: "#b612gol",
      fromNum: "3000505",
      toNum: "0" + phone.toString(),
      patternCode,
      inputData: [inputData],
    }
    axios
      .post("http://ippanel.com/api/select", data)
      .then((result) => {
        resolve(result)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

module.exports = SMS
