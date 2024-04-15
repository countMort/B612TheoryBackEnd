const { Types } = require("mongoose"),
  Category = require("../models/category"),
  Product = require("../models/product"),
  VoiceCard = require("../models/voiceCard"),
  Polaroid = require("../models/polaroid"),
  User = require("../models/user"),
  sharp = require("sharp"),
  { putFile } = require("../routes/functions/uploadFunctions"),
  Type = require("../models/type"),
  { download } = require("./fs"),
  fs = require("fs/promises"),
  Order = require("../models/order"),
  Address = require("../models/address"),
  fileSystem = require("fs"),
  QRCode = require("qrcode")
const { unload } = require("./ftp")

async function addProductsToCategories() {
  var categories = await Category.find()
  const products = await Product.find()
  categories.forEach((cat) => {
    cat.products = []
    products.forEach((prod) => {
      if (JSON.stringify(cat._id) == JSON.stringify(prod.category)) {
        cat.products.push(prod._id)
      }
    })
  })
  for (let index = 0; index < categories.length; index++) {
    await categories[index].save()
  }
}

async function addSham() {
  var category = await Category.findOne({ name: "شمع" })
  const product = await Product.findOne({ name: "شمع موم عسلی" })
  category.products.push(product._id)
  await category.save()
}

async function activateVoiceCards() {
  var voiceCards = await VoiceCard.find()
  for (let index = 0; index < voiceCards.length; index++) {
    if (!voiceCards[index].activated) {
      voiceCards[index].activated = true
      await voiceCards[index].save()
    }
  }
}

async function changeVoiceCardId() {
  var voiceCard = await VoiceCard.findOne({ _id: "60f57cc7c216ec3e0c723935" })
  voiceCard = { ...voiceCard }._doc
  voiceCard._id = Types.ObjectId("60f057c6900dd26785e37c5c")
  const result = await new VoiceCard(voiceCard).save()
  // const result = await VoiceCard.insert(voiceCard)
  console.log(result)
}

async function changeVoiceCardPassword() {
  var voiceCard = await VoiceCard.findOne({ _id: "61151aadcfe1c6f784e74db6" })
  voiceCard.password = 375020
  await voiceCard.save()
}

async function forgotPassword() {
  var users = await User.find()
  for (let index = 0; index < users.length; index++) {
    if (users[index].phone == 9112270439) {
      users[index].password = 1234
      await users[index].save()
      console.log(users[index])
      break
    }
  }
}

async function createThumbnail() {
  let products = await Product.find()
  for (let index = 0; index < products.length; index++) {
    let element = products[index]
    const photoPath = element.photos[0]
    const hasThumbnail = element.thumbnails[0]
    if (!photoPath || hasThumbnail) {
      console.log("continued")
      continue
    }
    // console.log(photoPath);
    let formatLength
    for (let i = photoPath.length - 1; i > 0; i--) {
      const letter = photoPath[i]
      if (letter == ".") {
        formatLength = i
        break
      }
    }
    const length = "https://dl.b612theory.ir/".length
    const thumbnailPath =
      photoPath.slice(length, formatLength) + "-thumbnail.png"
    // const tempThumbnailPath = thumbnailPath.slice(thumbnailPath.length - 20, thumbnailPath.length - 4)
    const tempThumbnailPath = index + "photo"
    await download(photoPath, tempThumbnailPath)

    await sharp(tempThumbnailPath)
      .resize({ width: 80, height: 80, fit: "inside" })
      .png()
      .toFile(tempThumbnailPath + ".png")
    const url = await putFile(tempThumbnailPath + ".png", thumbnailPath)
    element.thumbnails = [url]
    await element.save()
    await fs.unlink(tempThumbnailPath + ".png")
    await fs.unlink(tempThumbnailPath)
  }
  console.log("Thumbnailing Done")
}

async function changeAddressFullNameToFirstAndLastName() {
  let addresses = await Address.find()
  for (let index = 0; index < addresses.length; index++) {
    let address = addresses[index]
    const fullName = address.fullName.split(" ")
    const length = fullName.length
    address.firstName = fullName.slice(0, length - 1 || length).join(" ")
    if (length > 1) {
      address.lastName = fullName[length - 1]
    }
    if (!address.firstName) console.log(address)
    await address.save()
  }
}

async function sendSharpedPhotos() {
  try {
    setTimeout(async () => {
      const tempThumbnailPath = "photo"
      const fileName = "Turbulence.jpg"
      await download(
        "https://dl.b612theory.ir/admin/" + fileName,
        tempThumbnailPath
      )
      await sharp(tempThumbnailPath)
        .resize({ width: 100, height: 100, fit: "inside" })
        .png()
        .toFile("thumbnail" + tempThumbnailPath)
      const url = await putFile(
        "thumbnail" + tempThumbnailPath,
        "/admin/" + "thumbnail-" + fileName
      )
      console.log(url)
    }, 2000)
  } catch (error) {
    console.log(error)
  }
}

async function testDownloadSpeed() {
  for (let index = 0; index < 20; index++) {
    const startDate = Date.now()
    await download(
      "https://dl.b612theory.ir/admin/kahkeshan.jpg",
      `./routes/temp files/${index}.png`
    )
    console.log("downloadTime: ", Date.now() - startDate)
  }
}

async function removeOldPolaroids() {
  try {
    const polaroids = await Polaroid.find({ status: { $ne: "cleaned" } })
    const updatingPolaroids = []
    for (const polaroid of polaroids) {
      const daysAfterPurchase =
        (Date.now() - new Date(polaroid.createdTime)) / (1000 * 60 * 60 * 24)
      if (!polaroid.createdTime || daysAfterPurchase > 30) {
        const res1 = await unload(polaroid.photo)
        if (res1.result === "error") {
          if (res1.error && res1.error.code === 550) {
            polaroid.status = "cleaned"
          } else {
            console.error(res1.error)
          }
        } else {
          console.log(res1.path)
        }
        if (polaroid.thumbnail) await unload(polaroid.thumbnail)
        // polaroid.photo = null
        // polaroid.thumbnail = null
        updatingPolaroids.push(polaroid.save())
      }
    }
    await Promise.all(updatingPolaroids)
    console.log("Done & Dusted!")
  } catch (error) {
    console.error(error)
  }
}

module.exports = { removeOldPolaroids }
