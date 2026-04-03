const { randomUUID } = require("crypto");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { asyncHandler, AppError } = require("../utills/errorHandler");

/** Cache: DB sem migração de variantes (selectedColor/selectedSize) ainda funciona. */
let orderProductVariantColumnsCache = null;

async function orderProductHasVariantColumns() {
  if (orderProductVariantColumnsCache !== null) {
    return orderProductVariantColumnsCache;
  }
  try {
    const rows = await prisma.$queryRaw`
      SELECT COUNT(*) AS c
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'customer_order_product'
        AND COLUMN_NAME = 'selectedColor'
    `;
    orderProductVariantColumnsCache = Number(rows[0]?.c ?? 0) > 0;
    return orderProductVariantColumnsCache;
  } catch {
    orderProductVariantColumnsCache = false;
    return false;
  }
}

const createOrderProduct = asyncHandler(async (request, response) => {
  const { customerOrderId, productId, quantity, selectedColor, selectedSize } = request.body;

  // Validate required fields
  if (!customerOrderId) {
    throw new AppError("Customer order ID is required", 400);
  }
  if (!productId) {
    throw new AppError("Product ID is required", 400);
  }
  if (!quantity || quantity <= 0) {
    throw new AppError("Valid quantity is required", 400);
  }

  // Verify that the customer order exists
  const existingOrder = await prisma.customer_order.findUnique({
    where: { id: customerOrderId },
  });

  if (!existingOrder) {
    throw new AppError("Customer order not found", 404);
  }

  // Verify that the product exists
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!existingProduct) {
    throw new AppError("Product not found", 404);
  }

  const qty = parseInt(quantity, 10);
  const color =
    typeof selectedColor === "string" ? selectedColor.trim() || null : null;
  const size =
    typeof selectedSize === "string" ? selectedSize.trim() || null : null;

  if (await orderProductHasVariantColumns()) {
    const orderProduct = await prisma.customer_order_product.create({
      data: {
        customerOrderId,
        productId,
        quantity: qty,
        selectedColor: color,
        selectedSize: size,
      },
    });
    return response.status(201).json(orderProduct);
  }

  const id = randomUUID();
  await prisma.$executeRaw`
    INSERT INTO \`customer_order_product\` (\`id\`, \`customerOrderId\`, \`productId\`, \`quantity\`)
    VALUES (${id}, ${customerOrderId}, ${productId}, ${qty})
  `;
  return response.status(201).json({
    id,
    customerOrderId,
    productId,
    quantity: qty,
    selectedColor: color,
    selectedSize: size,
  });
});

const updateProductOrder = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const { customerOrderId, productId, quantity, selectedColor, selectedSize } = request.body;

  if (!id) {
    throw new AppError("Order product ID is required", 400);
  }

  const hasV = await orderProductHasVariantColumns();
  const existingOrder = await prisma.customer_order_product.findUnique({
    where: { id },
    ...(hasV
      ? {}
      : {
          select: {
            id: true,
            customerOrderId: true,
            productId: true,
            quantity: true,
          },
        }),
  });

  if (!existingOrder) {
    throw new AppError("Order product not found", 404);
  }

  if (quantity !== undefined && quantity <= 0) {
    throw new AppError("Quantity must be greater than 0", 400);
  }

  if (!hasV) {
    const updatedOrder = await prisma.customer_order_product.update({
      where: { id: existingOrder.id },
      data: {
        customerOrderId: customerOrderId || existingOrder.customerOrderId,
        productId: productId || existingOrder.productId,
        quantity: quantity !== undefined ? quantity : existingOrder.quantity,
      },
      select: {
        id: true,
        customerOrderId: true,
        productId: true,
        quantity: true,
      },
    });
    return response.json({
      ...updatedOrder,
      selectedColor: null,
      selectedSize: null,
    });
  }

  const updatedOrder = await prisma.customer_order_product.update({
    where: { id: existingOrder.id },
    data: {
      customerOrderId: customerOrderId || existingOrder.customerOrderId,
      productId: productId || existingOrder.productId,
      quantity: quantity !== undefined ? quantity : existingOrder.quantity,
      selectedColor:
        selectedColor !== undefined
          ? typeof selectedColor === "string"
            ? selectedColor.trim() || null
            : null
          : existingOrder.selectedColor,
      selectedSize:
        selectedSize !== undefined
          ? typeof selectedSize === "string"
            ? selectedSize.trim() || null
            : null
          : existingOrder.selectedSize,
    },
  });

  return response.json(updatedOrder);
});

const deleteProductOrder = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("Order product ID is required", 400);
  }

  const hasV = await orderProductHasVariantColumns();
  const existingOrder = await prisma.customer_order_product.findUnique({
    where: { id },
    ...(hasV
      ? {}
      : {
          select: { id: true },
        }),
  });

  if (!existingOrder) {
    throw new AppError("Order product not found", 404);
  }

  await prisma.customer_order_product.deleteMany({
    where: {
      customerOrderId: id,
    },
  });
  return response.status(204).send();
});

const getProductOrder = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("Order ID is required", 400);
  }

  const hasV = await orderProductHasVariantColumns();
  const order = await prisma.customer_order_product.findMany({
    where: {
      customerOrderId: id,
    },
    select: {
      id: true,
      customerOrderId: true,
      productId: true,
      quantity: true,
      ...(hasV ? { selectedColor: true, selectedSize: true } : {}),
      product: true,
    },
  });

  if (!order || order.length === 0) {
    throw new AppError("Order not found", 404);
  }

  if (!hasV) {
    return response.status(200).json(
      order.map((row) => ({
        ...row,
        selectedColor: null,
        selectedSize: null,
      })),
    );
  }

  return response.status(200).json(order);
});

const getAllProductOrders = asyncHandler(async (request, response) => {
  const hasV = await orderProductHasVariantColumns();
  const productOrders = await prisma.customer_order_product.findMany({
    select: {
      productId: true,
      quantity: true,
      ...(hasV ? { selectedColor: true, selectedSize: true } : {}),
      customerOrder: {
        select: {
          id: true,
          name: true,
          lastname: true,
          phone: true,
          email: true,
          company: true,
          adress: true,
          apartment: true,
          postalCode: true,
          dateTime: true,
          status: true,
          total: true,
        },
      },
    },
  });

  const ordersMap = new Map();

  for (const order of productOrders) {
    const { customerOrder, productId, quantity, selectedColor, selectedSize } = order;
    const { id, ...orderDetails } = customerOrder;
    const color = hasV ? selectedColor : null;
    const size = hasV ? selectedSize : null;

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        title: true,
        mainImage: true,
        price: true,
        slug: true,
      },
    });

    if (ordersMap.has(id)) {
      ordersMap.get(id).products.push({ ...product, quantity, selectedColor: color, selectedSize: size });
    } else {
      ordersMap.set(id, {
        customerOrderId: id,
        customerOrder: orderDetails,
        products: [{ ...product, quantity, selectedColor: color, selectedSize: size }],
      });
    }
  }

  const groupedOrders = Array.from(ordersMap.values());

  return response.json(groupedOrders);
});

module.exports = {
  createOrderProduct,
  updateProductOrder,
  deleteProductOrder,
  getProductOrder,
  getAllProductOrders,
};
