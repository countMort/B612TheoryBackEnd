var Type        = require("../models/type"),
    moment      = require("jalali-moment")

async function checkStockQuantity(cart) {
    if (cart.length == 0) return 500
    let types = await Type.find({
        _ids: {$in: cart.map(item => item._id)}
    })
    if (!types) return 404
    const constTypes = [...types]._doc
    let outOfStocks = new Array
    for (let index = 0; index < cart.length; index++) {
        let type = types.find(type => type == cart[index]._id)
        type.stockQuantity = type.stockQuantity - cart[index].quantity
        if (type.stockQuantity < 0 && !outOfStocks.find(oos => oos._id == type._id)) outOfStocks.push({
            _id: type._id,
            stockQuantity: constTypes.stockQuantity,
            name: type.name
        })
    }
    return outOfStocks.length > 0 ? outOfStocks : 200
}

function shipmentPrice(shipmentOption) {
    let estimated = moment().add(shipmentOption.days, "d").locale('fa').format('dddd Do MMMM'),
    createdTime = moment().locale('fa').format('dddd Do MMMM')
    return {estimated, price : shipmentOption.price, createdTime}
}

module.exports = {
    checkStockQuantity,
    shipmentPrice
}