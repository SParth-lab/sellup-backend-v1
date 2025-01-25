const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: [true, 'Product ID is required'] 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'User ID is required'] 
  },
  reviewText: { 
    type: String, 
    required: [true, 'Review text is required'], 
    trim: true 
  },
  rating: { 
    type: Number, 
    required: [true, 'Rating is required'], 
    min: [1, 'Rating must be at least 1'], 
    max: [5, 'Rating must be at most 5'] 
  },
  isDelete: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;