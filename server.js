const express = require('express'),
  morgan = require('morgan'),
  app = express(),
  mongoose = require('mongoose'),
  productRoutes = require('./routes/product'),
  categoryRoutes = require('./routes/category'),
  authRoutes = require('./routes/auth'),
  ownerRoutes = require('./routes/owner'),
  reviewRoutes = require('./routes/review'),
  cors = require('cors'),
  addressRoutes = require('./routes/address'),
  paymentRoutes = require('./routes/payment'),
  uploadRoutes = require('./routes/upload'),
  voiceCardRoutes = require('./routes/voiceCard'),
  diaryBookRoutes = require('./routes/diaryBook'),
  polaroidRoutes = require('./routes/polaroid'),
  bannerRoutes = require('./routes/banner'),
  sliderRoutes = require('./routes/slider'),
  featureRoutes = require('./routes/features'),
  logRoutes = require('./routes/logs'),
  statisticsRoutes = require('./routes/statistics'),
  PORT = process.env.PORT || 8080, //9905
  env = process.env.NODE_ENV || 'dev',
  dotenv = require('dotenv'),
  script = require('./utils/script')
// DATABASEURL = process.env.DATABASEURL
// Counter     = require('./models/counter')
dotenv.config()
const DATABASEURL =
  env == 'dev'
    ? 'mongodb://btheoryi_b612theory:#b612gol@b612theory.ir:27017/btheoryi_b612theory'
    : proccess.env.DATABASE_URL
// mongodb://localhost/27017

script()

// let counter = new Counter
// counter._id = "trackingCode"
// counter.seq = 61200000
// counter.save()
// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1); // Marboot be https://www.npmjs.com/package/express-rate-limit
// console.log(process.env.NODE_ENV);
function mongooseConnection() {
  mongoose.connect(
    DATABASEURL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    },
    (err) => {
      if (err) {
        console.log(err)
        setTimeout(() => mongooseConnection(), 10000)
      } else {
        console.log('Connected to the database')
      }
    }
  )
}
mongooseConnection()

// Middlewares
app.use(cors())
app.use(morgan('dev'))
app.set('trust proxy', true)
app.use(express.json({ limit: '25mb' }))

//required apis
app.use('/api', productRoutes)
app.use('/api', categoryRoutes)
app.use('/api', ownerRoutes)
app.use('/api', authRoutes)
app.use('/api', reviewRoutes)
app.use('/api', addressRoutes)
app.use('/api', paymentRoutes)
app.use('/api', uploadRoutes)
app.use('/api', voiceCardRoutes)
app.use('/api', diaryBookRoutes)
app.use('/api', polaroidRoutes)
app.use('/api', bannerRoutes)
app.use('/api', sliderRoutes)
app.use('/api', statisticsRoutes)
app.use('/api', logRoutes)
app.use('/api/features', featureRoutes)

// const   axios   = require('axios')
// function getMehran () {
//     return new Promise((resolve, reject) => {
//     axios.get('https://mehran-shirazi.herokuapp.com')
//         .then((result) => {
//             resolve(result)
//         }).catch((err) => {
//             reject(err)
//         });
//     })
// }

// setInterval(async () => {
//     try {
//         await getMehran()
//         console.log("got Mehran");
//     } catch (error) {
//         console.log("ridim");
//     }
// }, 1000*60*10);

app.listen(PORT, (err) => {
  if (err) {
    console.log(err)
  } else {
    console.log('Listening on PORT', PORT)
  }
})
