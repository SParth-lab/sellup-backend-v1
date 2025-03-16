const Review = require("../Models/Review.js");
const Product = require("../Models/Product.js");
const { calculateAverageRating } = require("../Helper/product.js");


const addReview = {
    validator: async (req, res, next) => {
        const { reviewText, rating, productId } = req.body;
        if (!reviewText || !rating || !productId) {
            return res.status(400).send({ error: "Review text, rating and productId are required" });
        }
        if (reviewText.length < 10) {
            return res.status(400).send({ error: "Review text must be at least 10 characters" });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).send({ error: "Rating must be between 1 and 5" });
        }
        const product = await Product.findOne({ _id: productId, isDelete: false }).lean();
        if (!product) {
            return res.status(400).send({ error: "Product not found" });
        }
        next();
    },
    controller: async (req, res) => {
        const { reviewText, rating, productId } = req.body;
        const { _id: userId } = req.user;


        // Check if the user has already added a review for this product
        const existingReview = await Review.findOne({ productId, userId }).lean();
        if (existingReview) {
            return res.status(400).send({ error: "User has already added a review for this product" });
        }

        const review = new Review({
            productId,
            userId,
            reviewText,
            rating,
        });
        const savedReview = await review.save();
        const populatedReview = await Review.populate(savedReview, { path: "userId", select: { name: 1, lastName: 1, avatar: 1 } });
        await calculateAverageRating(productId);
        return res.status(200).send({ message: "Review added successfully", review: populatedReview });
    }
}

const editReview = {
    validator: async (req, res, next) => {
        const { reviewId, reviewText, rating } = req.body;
        if (!reviewId || !reviewText || !rating) {
            return res.status(400).send({ error: "Review ID, review text and rating are required" });
        }
        if (reviewText.length < 10) {
            return res.status(400).send({ error: "Review text must be at least 10 characters" });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).send({ error: "Rating must be between 1 and 5" });
        }
        next();
    },
    controller: async (req, res) => {
        const { reviewId, reviewText, rating } = req.body;
        const update = {
            $set: {
                reviewText,
                rating
            }
        }
        const review =await Review.findOneAndUpdate({_id: reviewId}, update, { new: true }).populate("userId", {name: 1, lastName: 1, avatar: 1}).lean();
        if (!review) {
            return res.status(400).send({ error: "Review not found" });
        }
        await calculateAverageRating(review.productId);
        return res.status(200).send({ message: "Review updated successfully", review });
    }
}

const deleteReview = {
    validator: async (req, res, next) => {
        const { reviewId } = req.query;
        if (!reviewId) {
            return res.status(400).send({ error: "Review ID is required" });
        }
        next();
    },
    controller: async (req, res) => {
        const { reviewId } = req.query;
        const review = await Review.findByIdAndDelete(reviewId).lean();
        if (!review) {
            return res.status(400).send({ error: "Review not found" });
        }
        await calculateAverageRating(review.productId);
        return res.status(200).send({ message: "Review deleted successfully", review });
    }
}


const getReviews = {
    validator: async (req, res, next) => {
        const { productId } = req.query;
        if (!productId) {
            return res.status(400).send({ error: "Product ID is required" });
        }
        next();
    },
    controller: async (req, res) => {
        const { productId } = req.query;
        const criteria = {
            productId,
            isDelete: false
        }
        const reviews = await Review.find(criteria).populate("userId", {name: 1, lastName: 1, avatar: 1}).lean();
        if (!reviews) {
            return res.status(400).send({ error: "No reviews found" });
        }
        return res.status(200).send({ reviews });
    }
}

module.exports = { addReview, editReview, deleteReview, getReviews };