const router = require('express').Router(),
  verifyToken = require('../middlewares/verify-token'),
  isAdmin = require('../middlewares/is-admin'),
  Order = require('../models/order'),
  Type = require('../models/type'),
  Address = require('../models/address'),
  { shipmentPrice } = require('../utils/order'),
  responses = require('../middlewares/responses'),
  SMS = require('../utils/sms'),
  { deleteVoiceCard } = require('./functions/voiceCard'),
  deletePolaroid = require('./functions/deletePolaroid'),
  deleteDiaryBook = require('./functions/deleteDiaryBook'),
  VoiceCard = require('../models/voiceCard'),
  SHIPMENT = {
    normal: {
      price: 35000,
      days: 4,
      name: 'پیشتاز',
    },
    fast: {
      price: 45000,
      days: 2,
      name: 'ویژه',
    },
    discount: {
      home: 3000,
      allPhotosOrVoiceCards: 2000,
    },
  }

router.post('/shipment', (req, res) => {
  let shipment
  if (req.body.shipment === 'normal') {
    shipment = shipmentPrice(SHIPMENT.normal)
  } else {
    shipment = shipmentPrice(SHIPMENT.fast)
  }
  res.json({
    success: true,
    shipment,
  })
})

router.post('/order', verifyToken, async (req, res) => {
  try {
    let order = new Order()
    let cart = req.body.cart
    let foundTypes = await Type.find({
      _id: { $in: cart.map((item) => item._id) },
    })
      .populate('product product.category')
      .exec()
    let deliverTo = await Address.findOne({ _id: req.body.deliverTo })
    if (!deliverTo) return responses(res, 500, ['آدرس خود را وارد کنید'])
    let items = new Array()
    // console.log('card: ', cart);
    // console.log('foundTypes: ', foundTypes);
    cart.forEach((cartItem) => {
      foundTypes.forEach((type) => {
        if (cartItem._id == type._id) {
          type.stockQuantity = type.stockQuantity - cartItem.quantity
          type.product.stockQuantity =
            type.product.stockQuantity - cartItem.quantity
          if (type.stockQuantity < 0) {
            throw {
              message: `موجودی ${type.product.name} - ${cartItem.name} در انبار کافی نیست.`,
              status: 503,
            }
          } else if (type.product.stockQuantity < 0) {
            throw {
              message: `موجودی ${type.product.name} در انبار کافی نیست.`,
              status: 503,
            }
          } else {
            items.push({
              type: cartItem._id,
              name: cartItem.name,
              files: cartItem.files,
              photos: cartItem.photos,
              price: type.price,
              product: type.product._id,
              category: type.product.category,
              quantity: cartItem.quantity,
              voiceCard: cartItem.voiceCard,
              diaryBook: cartItem.diaryBook,
              polaroid: cartItem.polaroid,
            })
          }
        }
      })
    })
    order.user = req.decoded._id
    order.products = [...items]
    order.shipment = SHIPMENT[req.body.deliveryMethod]
    order.deliverTo = deliverTo
    await order.save()

    for (let index = 0; index < foundTypes.length; index++) {
      await foundTypes[index].save()
      await foundTypes[index].product.save()
      console.log(foundTypes[index].name, foundTypes[index].quantity, `\n`)
      console.log(
        foundTypes[index].product.name,
        foundTypes[index].product.quantity
      )
    }
    return res.json({
      success: true,
      message: 'سفارش شما با موفقیت ثبت شد.',
      order,
    })
  } catch (error) {
    responses(res, 500, [error.message])
  }
})

router.get('/orders', verifyToken, async (req, res) => {
  try {
    let orders = await Order.find({ user: req.decoded._id })
      .populate('products.category products.product')
      .exec()
    return res.json({
      success: true,
      orders,
    })
  } catch (error) {
    responses(res, error.status || 500, [error.message])
  }
})

router.get(
  '/orders/polaroids/:id',
  [verifyToken, isAdmin],
  async (req, res) => {
    try {
      const order = await Order.findOne({ _id: req.params.id })
        .populate('products.polaroid')
        .exec()
      let polaroids = order.products.map((order) => {
        if (order.polaroid) return order.polaroid
      })
      return res.sendFile()
    } catch (error) {
      console.log(error)
    }
  }
)

router.get('/admin/orders', [verifyToken, isAdmin], async (req, res) => {
  try {
    let query = {}
    if (req.query.status) query.status = req.query.status
    // let orders = await Order.find(query).populate("products.category products.product products.voiceCard products.polaroid products.diaryBook").sort([['paymentDate', -1]]).limit(30).exec()
    if (req.query.status && req.query.status == 'posted')
      query = {
        ...query,
        createdTime: { $gte: Date.now() - 35 * 1000 * 60 * 60 * 24 },
      }
    console.log(query)
    let orders = await Order.find(query)
      .populate(
        'products.category products.product products.voiceCard products.polaroid products.diaryBook'
      )
      .sort([['paymentDate', -1]])
      .exec()
    return responses(res, 200, ['سفارشات با موفقیت پیدا شدند'], orders)
  } catch (error) {
    responses(res, error.status || 500, [error.message])
  }
})

router.put('/order/:id', verifyToken, async (req, res) => {
  try {
    // status: empty | pending | creating | sending | posted | delivered | reject
    let order = await Order.findOne({ _id: req.params.id })
      .populate('user products.voiceCard')
      .exec()
    if (order) {
      const isAdmin = ['admin', 'super_admin'].includes(req.decoded.role)
      const reqStatus = order.status == req.body.status ? null : req.body.status
      if (
        isAdmin ||
        JSON.stringify(order.user._id) == JSON.stringify(req.decoded._id)
      ) {
        if (order.paymentCode != req.body.paymentCode) {
          order.status = 'pending'
        }
        for (let key in req.body) {
          if (
            key != '_id' &&
            (!['status', 'note', 'postCode'].includes(key) || isAdmin)
          )
            order[key] = req.body[key]
        }
        if (isAdmin) {
          if (reqStatus) {
            switch (reqStatus) {
              case 'creating':
                await SMS('creating', order.deliverTo.phoneNumber, {
                  name: order.deliverTo.fullName,
                  trackingCode: order.trackingCode,
                  days: SHIPMENT.normal.days,
                })
                break
              case 'posted':
                await SMS('posted', order.deliverTo.phoneNumber, {
                  name: order.deliverTo.fullName,
                  link: `b612theory.ir?redirect=post&code=${order.postCode}`,
                })
                break
              case 'reject':
                await SMS('reject', order.user.phone, {
                  name: order.user.name,
                  trackingCode: order.trackingCode,
                })
                break
              default:
                break
            }
            if (['creating', 'posted', 'delivered'].includes(order.status)) {
              for (let index = 0; index < order.products.length; index++) {
                let product = order.products[index]
                if (product.voiceCard && !product.voiceCard.activated) {
                  product.voiceCard.activated = true
                  await product.voiceCard.save()
                }
              }
            }
          }
        }
        await order.save()
        return responses(res, 200, ['سفارش با موفقیت بروزرسانی گردید.'], order)
      } else {
        return responses(res, 403)
      }
    } else {
      return responses(res, 404, ['سفارش'])
    }
  } catch (error) {
    responses(res, 500, [error.message])
  }
})

router.delete('/order/:id', verifyToken, async (req, res) => {
  try {
    let deletingOrder = await Order.findOneAndDelete({ _id: req.params.id })
      .populate(
        'products.product products.type products.voiceCard products.diaryBook products.polaroid'
      )
      .exec()
    if (req.decoded.role != 'admin' && req.decoded._id != deletingOrder.user)
      return responses(res, 403)
    let box = {
      types: [],
      products: [],
    }
    for (let index = 0; index < deletingOrder.products.length; index++) {
      let sale = deletingOrder.products[index]
      const typeIndex = box.types.indexOf(sale.type)
      const productIndex = box.types.indexOf(sale.product)
      if (typeIndex == -1) {
        box.types.push(sale.type)
        box.types[box.types.length - 1].stockQuantity += sale.quantity
      } else {
        box.types[typeIndex].stockQuantity += sale.quantity
      }
      if (productIndex == -1) {
        box.products.push(sale.product)
        box.products[box.products.length - 1].stockQuantity += sale.quantity
      } else {
        box.products[productIndex].stockQuantity += sale.quantity
      }

      sale.voiceCard && (await deleteVoiceCard(sale.voiceCard))
      sale.diaryBook && (await deleteDiaryBook(sale.diaryBook))
      sale.polaroid && (await deletePolaroid(sale.polaroid))
    }

    for (let key in box) {
      for (let index = 0; index < box[key].length; index++) {
        await box[key][index].save()
      }
    }
    return responses(res, 202, ['سفارش'], deletingOrder)
  } catch (error) {
    console.trace(error)
    responses(res, 500, [error.message || error])
  }
})

module.exports = router
