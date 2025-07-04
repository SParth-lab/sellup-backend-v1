const User = require("../Models/User.js");
const Review = require("../Models/Review.js");
const Product = require("../Models/Product.js");
const mongoose = require("mongoose");
const updateProductLimit = async (userId, isAddProduct, res) => {
    const user = await User.findOne({_id: userId}).select({productLimit:1, productCount:1}).lean();
    if (!user) {
        return res.status(400).send({error: "User not found"});
    }
      if (isAddProduct) {
          if (user.productCount >= user.productLimit) {
              return res.status(400).send({error: "You have reached your product limit"});
          }
          await User.updateOne({_id: userId}, {$inc: {productCount: 1}});
      }else if (user.productCount > 0) {
          await User.updateOne({_id: userId}, {$inc: {productCount: -1}});
      }
}


const calculateAverageRating = async (productId) => {
    try {
      // Validate the productId parameter
      if (!productId) {
        throw new Error('productId is required');
      }
  
      // Match the product and calculate the average rating and total reviews
      const result = await Review.aggregate([
        { $match: { productId: new mongoose.Types.ObjectId(productId) } },
        {
          $group: {
            _id: '$productId',
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
          },
        },
      ]);
  
      // If no result is found, return default values
      if (result.length === 0) {
        return { averageRating: 0, totalReviews: 0 };
      }
  
      // Extract the first result as it's the only one expected
      const { averageRating, totalReviews } = result[0];
  
      // Update the product with the average rating and total reviews
      await Product.findByIdAndUpdate(productId, {
        averageRating: averageRating.toFixed(1),
        ratingCount: totalReviews,
      });
  
      // Return the calculated average rating and total reviews
      return { averageRating: parseFloat(averageRating.toFixed(1)), totalReviews };
    } catch (error) {
      console.error('Error calculating average rating:', error); // Log error for debugging
      throw new Error('Failed to calculate average rating'); // Throw error for error handling
    }
  };

module.exports = { updateProductLimit, calculateAverageRating };