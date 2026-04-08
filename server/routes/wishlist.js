const express = require("express");

const router = express.Router();

const {
  getAllWishlistByUserId,
  getAllWishlist,
  createWishItem,
  deleteWishItem,
  getSingleProductFromWishlist,
} = require("../controllers/wishlist");

const { requireAdmin, requireAuth, requireSelfOrAdmin } = require("../middleware/auth");

router.route("/").get(requireAdmin, getAllWishlist).post(requireAuth, createWishItem);

router.route("/:userId").get(requireSelfOrAdmin("userId"), getAllWishlistByUserId);
router
  .route("/:userId/:productId")
  .get(requireSelfOrAdmin("userId"), getSingleProductFromWishlist)
  .delete(requireSelfOrAdmin("userId"), deleteWishItem);

module.exports = router;
