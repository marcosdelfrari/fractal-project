const express = require("express");

const router = express.Router();
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} = require("../controllers/products");

const { requireAdmin, requireAdminIfQueryAdmin } = require("../middleware/auth");

router.route("/").get(requireAdminIfQueryAdmin, getAllProducts).post(requireAdmin, createProduct);

router
  .route("/:id")
  .get(getProductById)
  .put(requireAdmin, updateProduct)
  .delete(requireAdmin, deleteProduct);

module.exports = router;
