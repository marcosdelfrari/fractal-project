const express = require("express");

const router = express.Router();

const {
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserByEmail,
  getUserProfile,
  updateUserProfile,
  getUserOrders,
} = require("../controllers/users");

router.route("/").get(getAllUsers).post(createUser);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

router.route("/email/:email").get(getUserByEmail);

// Profile routes
router.route("/:id/profile").get(getUserProfile).put(updateUserProfile);

// Orders routes
router.route("/:id/orders").get(getUserOrders);

module.exports = router;
