// =============
// Authorization
// =============

const express = require('express')
const router = express.Router()
const passport = require('passport')
const User = require('../models/user')

// Home page
router.get('/', (req, res) => {
  res.render('landing')
})

// Login page
router.get('/login', (req, res) => {
  res.render('login')
})

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/trails',
    failureRedirect: '/login',
  }),
  (req, res) => {},
)

// Register page
router.get('/register', (req, res) => {
  res.render('register')
})

router.post('/register', (req, res) => {
  let newUser = new User({
    username: req.body.username,
    email: req.body.email,
  })
  if (req.body.password !== req.body.password_confirm) {
    req.flash('error', 'Passwords do not match')
    return res.redirect('register')
  }
  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      req.flash('error', err.message)
      res.redirect('register')
    } else {
      passport.authenticate('local')(req, res, () => {
        req.flash('success', 'Welcome to the PiedmontTrailFinder Community!')
        res.redirect('/trails')
      })
    }
  })
})

// Logout
router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success', 'Successfully logged out')
  res.redirect('/trails')
})

module.exports = router
