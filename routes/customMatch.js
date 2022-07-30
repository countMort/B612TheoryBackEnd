const router = require('express').Router(),
  DiaryBook = require('../models/diaryBook'),
  verifyToken = require('../middlewares/verify-token'),
  isAdmin = require('../middlewares/is-admin'),
  deleteDiaryBook = require('./functions/deleteDiaryBook'),
  responses = require('../middlewares/responses')

// POST request - create a new diary-book
router.post('/custom-match', verifyToken, async (req, res) => {
  try {
    let diaryBook = new DiaryBook()
    diaryBook.photos = req.body.photos
    diaryBook.video = req.body.video
    diaryBook.quote = req.body.quote
    diaryBook.type = req.body.type
    diaryBook.user = req.decoded._id
    await diaryBook.save()
    res.json({
      status: true,
      message: 'کتاب خاطره با موفقیت ذخیره شد',
      diaryBook,
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    })
  }
})

// GET request - get all diaryBooks

router.get('/diary-book', async (req, res) => {
  try {
    let diaryBooks = await DiaryBook.find()
    res.json({
      success: true,
      diaryBooks: diaryBooks,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// GET request - get a single diary-book

router.get('/diary-book/:id', async (req, res) => {
  try {
    let diaryBook = await DiaryBook.findOne({ _id: req.params.id })
    res.json({
      success: true,
      diaryBook,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// PUT request - update a single diaryBook

router.put('/diary-book/:id', [verifyToken, isAdmin], async (req, res) => {
  try {
    let diaryBook = await DiaryBook.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      {
        $set: {
          video: req.body.video,
          quote: req.body.quote,
          type: req.body.type,
          photos: req.body.photos,
        },
      }
      // {
      //     upsert: true
      // }
    )
    res.json({
      success: true,
      updatedProduct: diaryBook,
      message: 'کتاب خاطره با موفقیت به‌روز شد.',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// DELETE request - delete a single diary-book

router.delete('/diary-book/:id', verifyToken, async (req, res) => {
  try {
    let diaryBook = await DiaryBook.findOne({ _id: req.params.id })
    if (!diaryBook) return responses(res, 202, [], diaryBook)
    if (
      ['admin', 'super_admin'].indexOf(req.decoded.role) != -1 ||
      JSON.stringify(diaryBook.user) == JSON.stringify(req.decoded._id)
    ) {
      await deleteDiaryBook(diaryBook)
      return responses(res, 202, ['کتاب خاطره'], diaryBook)
    }
    return responses(res, 403)
  } catch (error) {
    return responses(res, 500, [error.message || error])
  }
})

module.exports = router
