const express = require("express");

const router = express.Router();

const {
  getCustomerOrder,
  createCustomerOrder,
  updateCustomerOrder,
  deleteCustomerOrder,
  getAllOrders,
  getOrderLineItems,
  createOrderLineItemNested,
  getAllProductOrders,
  deleteAllOrderLineItemsForOrder,
  deleteOrderLineItemNested,
} = require("../controllers/customer_orders");

const { updateOrderLineItemNested } = require("../controllers/customer_order_product");

const { requireAdmin, requireOrderOwnerOrAdmin } = require("../middleware/auth");

router.route("/").get(requireAdmin, getAllOrders).post(createCustomerOrder);

/** Admin: visão agregada de linhas — GET /api/orders/product-lines */
router.get("/product-lines", requireAdmin, getAllProductOrders);

router.delete(
  "/:orderId/items/:lineId",
  requireOrderOwnerOrAdmin("orderId"),
  deleteOrderLineItemNested,
);
router.delete(
  "/:orderId/items",
  requireOrderOwnerOrAdmin("orderId"),
  deleteAllOrderLineItemsForOrder,
);

router.get(
  "/:orderId/items",
  requireOrderOwnerOrAdmin("orderId"),
  getOrderLineItems,
);
router.post(
  "/:orderId/items",
  requireOrderOwnerOrAdmin("orderId"),
  createOrderLineItemNested,
);

router.put(
  "/:orderId/items/:lineId",
  requireOrderOwnerOrAdmin("orderId"),
  updateOrderLineItemNested,
);

router
  .route("/:id")
  .get(requireOrderOwnerOrAdmin("id"), getCustomerOrder)
  .put(requireOrderOwnerOrAdmin("id"), updateCustomerOrder)
  .delete(requireOrderOwnerOrAdmin("id"), deleteCustomerOrder);

module.exports = router;
