const mongoose = require('mongoose')

// Create schema
const trailSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    username: String,
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
    },
  ],
  rating: {
    type: Number,
    default: 0,
  },
})

// Create model from schema
module.exports = mongoose.model('Trail', trailSchema)
