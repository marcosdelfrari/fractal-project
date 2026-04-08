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

const {
  requireSelfOrAdmin,
  requireAddressOwnerOrAdmin,
} = require("../middleware/auth");

// Get all addresses for a user
router
  .route("/user/:userId")
  .get(requireSelfOrAdmin("userId"), getUserAddresses)
  .post(requireSelfOrAdmin("userId"), createAddress);

// Set address as default (antes de /:addressId só com um segmento)
router
  .route("/:addressId/default")
  .put(requireAddressOwnerOrAdmin("addressId"), setDefaultAddress);

// Get, update, or delete a specific address
router
  .route("/:addressId")
  .get(requireAddressOwnerOrAdmin("addressId"), getAddress)
  .put(requireAddressOwnerOrAdmin("addressId"), updateAddress)
  .delete(requireAddressOwnerOrAdmin("addressId"), deleteAddress);

module.exports = router;
