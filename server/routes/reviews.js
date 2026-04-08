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

const {
  requireAuth,
  requireReviewOwnerOrAdmin,
  requireSelfOrAdmin,
} = require("../middleware/auth");

// Get all reviews for a product
router.route("/product/:productId").get(getProductReviews);

// Get all reviews by a user (próprio usuário ou admin)
router.route("/user/:userId").get(requireSelfOrAdmin("userId"), getUserReviews);

// Create a new review
router.route("/").post(requireAuth, createReview);

// Get, update, or delete a specific review
router
  .route("/:reviewId")
  .get(getReview)
  .put(requireReviewOwnerOrAdmin(), updateReview)
  .delete(requireReviewOwnerOrAdmin(), deleteReview);

module.exports = router;
