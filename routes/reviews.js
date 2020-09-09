const express = require('express')
const router = express.Router({ mergeParams: true })
const Trail = require('../models/trail')
const Review = require('../models/review')
const Middleware = require('../middleware')

// Index route
router.get('/', (req, res) => {
  Trail.findById(req.params.id)
    .populate({
      path: 'reviews',
      options: { sort: { createdAt: -1 } },
    })
    .exec((err, foundTrail) => {
      if (err || !foundTrail) {
        req.flash('error', err.message)
        res.redirect('back')
      } else res.render('reviews/index', { trail: foundTrail })
    })
})

// New route
router.get(
  '/new',
  Middleware.isLoggedIn,
  Middleware.checkReviewExistence,
  (req, res) => {
    Trail.findById(req.params.id, (err, foundTrail) => {
      if (err) {
        req.flash('error', err.message)
        res.redirect('back')
      } else res.render('newReview', { trail: foundTrail })
    })
  },
)

// Create route
router.post(
  '/',
  Middleware.isLoggedIn,
  Middleware.checkReviewExistence,
  (req, res) => {
    Trail.findById(req.params.id, (err, foundTrail) => {
      if (err) {
        req.flash('error', err.message)
        res.redirect('back')
      } else {
        Review.create(req.body.review, (err, review) => {
          review.author.id = req.user._id
          review.author.username = req.user.username
          review.trail = foundTrail
          review.save()
          foundTrail.reviews.push(review)
          foundTrail.rating = calculateAverage(foundTrail.reviews)
          foundTrail.save()
          req.flash('success', 'Your review has been successfully added.')
          res.redirect('/trails/' + foundTrail._id)
        })
      }
    })
  },
)

// Edit route
router.get('/:review_id/edit', Middleware.checkReviewOwnership, (req, res) => {
  Review.findById(req.params.review_id, (err, foundReview) => {
    if (err) {
      req.flash('error', err.message)
      res.redirect('back')
    } else
      res.render('editReview', {
        trail_id: req.params.id,
        review: foundReview,
      })
  })
})

// Update route
router.put('/:review_id', Middleware.checkReviewOwnership, (req, res) => {
  Review.findByIdAndUpdate(
    req.params.review_id,
    req.body.review,
    { new: true },
    (err, updatedReview) => {
      if (err) {
        req.flash('error', err.message)
        res.redirect('back')
      }
      Trail.findById(req.params.id)
        .populate('reviews')
        .exec((err, trail) => {
          if (err) {
            req.flash('error', err.message)
            res.redirect('back')
          } else {
            trail.rating = calculateAverage(trail.reviews)
            trail.save()
            req.flash('success', 'Your review was successfully edited.')
            res.redirect('/trails/' + trail._id)
          }
        })
    },
  )
})

router.delete('/:review_id', Middleware.checkReviewOwnership, (req, res) => {
  Review.findByIdAndRemove(req.params.review_id, (err, foundReview) => {
    if (err) {
      req.flash('error', err.message)
      res.redirect('back')
    }
    Trail.findByIdAndUpdate(
      req.params.id,
      { $pull: { reviews: req.params.review_id } },
      { new: true },
    )
      .populate('reviews')
      .exec((err, trail) => {
        if (err) {
          req.flash('error', err.message)
          res.redirect('back')
        } else {
          trail.rating = calculateAverage(trail.reviews)
          trail.save()
          req.flash('success', 'Your review was deleted successfully.')
          res.redirect('/trails/' + req.params.id)
        }
      })
  })
})

function calculateAverage(reviews) {
  if (reviews.length === 0) return 0
  let sum = 0
  reviews.forEach((review) => {
    sum += review.rating
  })
  return sum / reviews.length
}

module.exports = router
