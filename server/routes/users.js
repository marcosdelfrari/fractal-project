const express = require("express");

const router = express.Router();

const {
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  getUserOrders,
} = require("../controllers/users");

const { requireAdmin, requireAuth, requireSelfOrAdmin } = require("../middleware/auth");

router.route("/").get(requireAdmin, getAllUsers).post(requireAdmin, createUser);

// Antes de /:id — sessão atual (sem lookup por e-mail na URL)
router.get("/me", requireAuth, getCurrentUser);

router
  .route("/:id")
  .get(requireSelfOrAdmin("id"), getUser)
  .put(requireSelfOrAdmin("id"), updateUser)
  .delete(requireSelfOrAdmin("id"), deleteUser);

// Profile routes
router
  .route("/:id/profile")
  .get(requireSelfOrAdmin("id"), getUserProfile)
  .put(requireSelfOrAdmin("id"), updateUserProfile);

// Orders routes
router.route("/:id/orders").get(requireSelfOrAdmin("id"), getUserOrders);

module.exports = router;
