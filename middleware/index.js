const Trail = require('../models/trail')
const Review = require('../models/review')
let middlewareObject = {}

// Trail authorization middleware
middlewareObject.checkTrailOwnership = function checkTrailOwnership(
  req,
  res,
  next,
) {
  if (req.isAuthenticated()) {
    Trail.findById(req.params.id, (err, foundTrail) => {
      if (err || !foundTrail) {
        req.flash('error', 'Trail not found')
        res.redirect('back')
      } else {
        if (req.user._id.equals(foundTrail.author.id)) {
          next()
        } else {
          req.flash('error', 'You do not have permission to do that')
          res.redirect('back')
        }
      }
    })
  } else {
    req.flash('error', 'You need to be logged in to do that')
    res.redirect('back')
  }
}

// Review authorization middleware
middlewareObject.checkReviewOwnership = function (req, res, next) {
  if (req.isAuthenticated()) {
    Review.findById(req.params.review_id, function (err, foundReview) {
      if (err || !foundReview) {
        res.redirect('back')
      } else {
        if (foundReview.author.id.equals(req.user._id)) {
          next()
        } else {
          req.flash('error', 'You do not have permission to do that')
          res.redirect('back')
        }
      }
    })
  } else {
    req.flash('error', 'You need to be logged in to do that')
    res.redirect('back')
  }
}

// Review existence check middleware
middlewareObject.checkReviewExistence = function (req, res, next) {
  if (req.isAuthenticated()) {
    Trail.findById(req.params.id)
      .populate('reviews')
      .exec((err, foundTrail) => {
        if (err || !foundTrail) {
          req.flash('error', 'Trail not found.')
          res.redirect('back')
        } else {
          let foundUserReview =
            foundTrail.reviews &&
            foundTrail.reviews.some((review) => {
              return review.author.id.equals(req.user._id)
            })
          if (foundUserReview) {
            req.flash('error', 'You already wrote a review.')
            return res.redirect('/trails/' + foundTrail._id)
          }
          next()
        }
      })
  } else {
    req.flash('error', 'You need to login first.')
    res.redirect('back')
  }
}

// Authentication middleware
middlewareObject.isLoggedIn = function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next()
  req.flash('error', 'You need to be logged in to do that')
  res.redirect('/login')
}

module.exports = middlewareObject
