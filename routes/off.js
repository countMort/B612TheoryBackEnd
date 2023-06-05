const router = require("express").Router(),
  { isAdmin } = require("../middlewares/auth"),
  { Off, offScheme } = require("../models/off"),
  responses = require("../middlewares/responses")

router.get("/", async (req, res) => {
  try {
    let offs
    if (req.query && req.query.title) {
      offs = await Off.find({
        title: req.query.title,
      })
    } else {
      const IsAdmin = isAdmin(req)
      if (IsAdmin) offs = await Off.find()
    }
    return responses(res, 200, ["تخفیف ها با موفقیت ارسال شدند"], offs)
  } catch (error) {
    responses(res, 500, [error.message])
  }
})

router.get("/:id", isAdmin, async (req, res) => {
  try {
    const off = await Off.findOne({ _id: req.params.id })
    return responses(res, 200, ["تخفیف با موفقیت ارسال شد"], off)
  } catch (error) {
    responses(res, 500, [error.message])
  }
})

// POST request

router.post("/", isAdmin, async (req, res) => {
  try {
    const off = new Off()
    for (const key in offScheme) {
      if (Object.hasOwnProperty.call(req.body, key)) {
        off[key] = req.body.key
      }
    }
    await off.save()
    res.json({
      success: true,
      message: "تخفیف با موفقیت ایجاد شد",
      off,
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    })
  }
})

// UPDATE request

router.put("/:id", isAdmin, async (req, res) => {
  try {
    const foundOff = await Off.findOne({ _id: req.params.id })
    if (foundOff) {
      await foundOff.save()
      res.json({
        success: true,
        message: "تخفیف با موفقیت به روز شد",
        result: foundOff,
      })
    } else {
      res.status(404).json({
        success: false,
        message: "تخفیف یافت نشد.",
      })
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    })
  }
})

// DELETE request

router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const deletedOff = await Off.deleteOne({ _id: req.params.id })
    if (deletedOff) {
      res.json({
        success: true,
        message: "تخفیف با موفقیت حذف شد",
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

module.exports = router
