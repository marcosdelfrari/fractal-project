const express = require("express");

const router = express.Router();

const {
  getProductReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
} = require("../controllers/reviews");

// Get all reviews for a product
router.route("/product/:productId").get(getProductReviews);

// Get all reviews by a user
router.route("/user/:userId").get(getUserReviews);

// Create a new review
router.route("/").post(createReview);

// Get, update, or delete a specific review
router.route("/:reviewId").get(getReview).put(updateReview).delete(deleteReview);

module.exports = router;
