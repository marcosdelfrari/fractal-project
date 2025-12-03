const express = require("express");

const router = express.Router();

const {
  getUserAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/addresses");

// Get all addresses for a user
router.route("/user/:userId").get(getUserAddresses);

// Create address for a user
router.route("/user/:userId").post(createAddress);

// Get, update, or delete a specific address
router
  .route("/:addressId")
  .get(getAddress)
  .put(updateAddress)
  .delete(deleteAddress);

// Set address as default
router.route("/:addressId/default").put(setDefaultAddress);

module.exports = router;
