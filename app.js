const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const passport = require('passport')
const flash = require('connect-flash')
const Trail = require('./models/trail')
const User = require('./models/user')
const LocalStrategy = require('passport-local')
const methodOverride = require('method-override')
const dotenv = require('dotenv')

// Routes
const trailRoutes = require('./routes/trails')
const authRoutes = require('./routes/auth')
const reviewRoutes = require('./routes/reviews')

// Env
dotenv.config({ path: './config/config.env' })

// Database
let db = process.env.MONGODB_URL || 'mongodb://localhost:27017/trails'
db = process.env.MONGO_URI
mongoose.connect(
  db,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    replicaSet: 'Cluster0-shard-0',
  },
  (req, res) => {
    console.log('Connected to DB')
  },
)

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))
app.use(methodOverride('_method'))
app.use(flash())

// Passport config
app.use(
  require('express-session')({
    secret: 'keeto nino jeepo lemur',
    resave: false,
    saveUninitialized: false,
  }),
)
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// Variables for all templates to use
app.use((req, res, next) => {
  res.locals.currentUser = req.user
  res.locals.error = req.flash('error')
  res.locals.success = req.flash('success')
  next()
})

// Routes
app.use('/', authRoutes)
app.use('/trails', trailRoutes)
app.use('/trails/:id/reviews', reviewRoutes)

// Starter data

// Trail.create(
//   {
//     name: "Angel's Landing",
//     image: 'https://images.unsplash.com/photo-1476041800959-2f6bb412c8ce',
//     description: "Camp on top of the iconic Angel's Landing hike.",
//   },
//   (err, trail) => {
//     if (err) console.log(err)
//     else {
//       console.log(trail)
//     }
//   },
// )

const port = process.env.PORT || 3000
app.listen(port, () => console.log('Listening on Port ' + port))
