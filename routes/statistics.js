const router    = require("express").Router(),
    verifyToken = require('../middlewares/verify-token'),
    isAdmin     = require('../middlewares/is-admin'),
    Order       = require('../models/order'),
    responses   = require('../middlewares/responses')

router.get("/stats", [verifyToken, isAdmin], async (req,res)=> {
    try {
        const orders = await Order.find().populate('products.product').exec()
        let stats = []
        let totalQuantity = 0
        let totalPrice = 0
        for (let index = 0; index < orders.length; index++) {
            const order = orders[index]
            if (['empty', 'reject'].includes(order.status)) continue;
            order.products.forEach(prod => {
                const foundStat = stats.find(stat => JSON.stringify(stat.id) == JSON.stringify(prod.type))
                if (foundStat) {
                    foundStat.quantity += Number(prod.quantity)
                    foundStat.price += Number(prod.price)
                } else {
                    stats.push({
                        name: prod.product ? prod.product.name : '',
                        type: prod.name,
                        quantity: prod.quantity,
                        id: prod.type,
                        price: prod.price
                    })
                }
                totalQuantity += Number(prod.quantity)
                totalPrice += Number(prod.price)
            });
        }
        return responses(res, 200, ['آمار با موفقیت ایجاد شد'], {stats, totalPrice, totalQuantity})
    } catch (error) {
        responses(res,500,[error.message])
    }
})


module.exports = router;