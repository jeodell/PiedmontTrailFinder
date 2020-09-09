// =============
// Trails
// =============

const express = require('express')
const router = express.Router()
const Trail = require('../models/trail')
const Review = require('../models/review')
const Middleware = require('../middleware')

// Index route
router.get('/', (req, res) => {
  let trailsPerPage = 8
  let pageQuery = parseInt(req.query.page)
  let pageNumber = pageQuery ? pageQuery : 1
  Trail.find({})
    .skip(trailsPerPage * pageNumber - trailsPerPage)
    .limit(trailsPerPage)
    .exec((err, allTrails) => {
      Trail.count().exec((err, count) => {
        if (err) {
          req.flash('error:', 'Error finding trails')
          res.redirect('back')
        } else
          res.render('index', {
            trails: allTrails,
            current: pageNumber,
            pages: Math.ceil(count / trailsPerPage),
          })
      })
    })
})

// Create route
router.post('/', Middleware.isLoggedIn, (req, res) => {
  let name = req.body.name
  let image = req.body.image
  let description = req.body.description
  let author = {
    id: req.user._id,
    username: req.user.username,
  }
  let newTrail = {
    name: name,
    image: image,
    description: description,
    author: author,
  }
  Trail.create(newTrail, (err, createdTrail) => {
    if (err) {
      req.flash('error', 'Error creating the trail')
      res.redirect('back')
    } else res.redirect('/trails')
  })
})

// New route
router.get('/new', Middleware.isLoggedIn, (req, res) => {
  res.render('newTrail')
})

// Show route
router.get('/:id', (req, res) => {
  Trail.findById(req.params.id)
    .populate({
      path: 'reviews',
      options: { sort: { createdAt: -1 } },
    })
    .exec((err, foundTrail) => {
      if (err || !foundTrail) {
        res.redirect('/trails')
      } else {
        res.render('show', { trail: foundTrail })
      }
    })
})

// Edit route
router.get('/:id/edit', Middleware.checkTrailOwnership, (req, res) => {
  Trail.findById(req.params.id, (err, foundTrail) => {
    if (err) {
      req.flash('error', 'Error finding the trail')
      res.redirect('/trails')
    } else {
      res.render('editTrail', { trail: foundTrail })
    }
  })
})

// Update route
router.put('/:id', Middleware.checkTrailOwnership, (req, res) => {
  Trail.findByIdAndUpdate(
    req.params.id,
    req.body.trail,
    (err, updatedTrail) => {
      if (err || !updatedTrail) {
        req.flash('error', 'Error updating the trail')
        res.redirect('/trails')
      } else res.redirect('/trails/' + req.params.id)
    },
  )
})

// Delete route
router.delete('/:id', Middleware.checkTrailOwnership, (req, res) => {
  Trail.findByIdAndRemove(req.params.id, (err, foundTrail) => {
    if (err) {
      req.flash('error', 'Error finding the trail')
      res.redirect('/trails')
    }

    Review.deleteMany({ _id: { $in: foundTrail.reviews } }, (err) => {
      req.flash('success', 'Trail deleted')
      res.redirect('/trails')
    })
  })
})

// Like create route
router.post('/:id/like', Middleware.isLoggedIn, function (req, res) {
  Trail.findById(req.params.id, (err, foundTrail) => {
    if (err) {
      console.log(err)
      return res.redirect('/trails')
    }

    let foundUserLike = foundTrail.likes.some((like) => {
      return like.equals(req.user._id)
    })

    if (foundUserLike) {
      foundTrail.likes.pull(req.user._id)
    } else {
      foundTrail.likes.push(req.user)
    }

    foundTrail.save(function (err) {
      if (err) {
        console.log(err)
      }
      return res.redirect('/trails')
    })
  })
})

module.exports = router
