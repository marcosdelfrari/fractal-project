const { randomUUID } = require("crypto");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  validateOrderData,
  validateOrderItemsPayload,
  ValidationError,
} = require("../utills/validation");
const {
  fetchLineItemsByCustomerOrderId,
  createOrderLineItemsInTransaction,
  createOrderProduct,
  getAllProductOrders,
} = require("./customer_order_product");
const {
  hashOrderPayload,
  stableOrderItemsForHash,
  normalizeIdempotencyKey,
  tryBeginIdempotentCreate,
  recordIdempotentSuccess,
  MAX_KEY_LEN,
} = require("../utills/orderIdempotency");

/** GET /api/orders/:id — produtos vêm por padrão; use `include=none` ou `include=` para só o cabeçalho do pedido. */
function orderIncludesProductsQuery(query) {
  const raw = query?.include;
  if (raw === undefined || raw === null) return true;
  if (typeof raw !== "string") return false;
  if (raw === "full") return true;
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === "none") return false;
  return trimmed
    .split(",")
    .map((s) => s.trim())
    .includes("products");
}

async function createCustomerOrder(request, response) {
  try {
    console.log("=== ORDER CREATION REQUEST ===");

    // Validate request body
    if (!request.body || typeof request.body !== "object") {
      console.log("❌ Invalid request body");
      return response.status(400).json({
        error: "Corpo da requisição inválido",
        details: "O corpo da requisição deve ser um objeto JSON válido",
      });
    }

    // Server-side validation
    const validation = validateOrderData(request.body);

    if (!validation.isValid) {
      console.log("❌ Validation failed:", validation.errors);
      return response.status(400).json({
        error: "Falha na validação",
        details: validation.errors,
      });
    }

    const validatedData = validation.validatedData;

    const hasItemsKey = Object.prototype.hasOwnProperty.call(
      request.body,
      "items",
    );
    let normalizedLineItems = null;
    let stableForIdem = null;
    if (hasItemsKey) {
      const iv = validateOrderItemsPayload(request.body.items);
      if (!iv.isValid) {
        return response.status(400).json({
          error: "Falha na validação dos itens",
          details: iv.errors,
        });
      }
      normalizedLineItems = iv.normalizedItems;
      stableForIdem = stableOrderItemsForHash(normalizedLineItems);
    }

    const confirmDuplicateOrder =
      request.body?.confirmDuplicateOrder === true ||
      request.body?.confirmDuplicateOrder === "true";

    const idemHeaderRaw = request.get("idempotency-key");
    const idemKey = normalizeIdempotencyKey(idemHeaderRaw);
    if (idemHeaderRaw != null && String(idemHeaderRaw).trim() !== "" && !idemKey) {
      return response.status(400).json({
        error: "Idempotency-Key inválida",
        details: `Use entre 1 e ${MAX_KEY_LEN} caracteres ou omita o cabeçalho.`,
      });
    }

    if (process.env.ORDER_REQUIRE_IDEMPOTENCY_KEY === "true" && !idemKey) {
      return response.status(400).json({
        error: "Cabeçalho Idempotency-Key obrigatório",
        details: "Envie Idempotency-Key (UUID recomendado) para criar pedidos.",
      });
    }

    const payloadHash = hashOrderPayload(
      validatedData,
      confirmDuplicateOrder,
      stableForIdem,
    );

    if (idemKey) {
      const idem = tryBeginIdempotentCreate(idemKey, payloadHash);
      if (idem.conflict) {
        return response.status(409).json({
          error: "Conflito de idempotência",
          code: "IDEMPOTENCY_KEY_REUSE",
          details:
            "Esta Idempotency-Key já foi usada com outro corpo de pedido.",
        });
      }
      if (idem.hit) {
        return response.status(idem.status).json(idem.body);
      }
    }

    // Additional business logic validation
    if (validatedData.total < 0.01) {
      console.log("❌ Invalid total amount");
      return response.status(400).json({
        error: "Total do pedido inválido",
        details: [
          {
            field: "total",
            message: "O total do pedido deve ser de pelo menos R$ 0,01",
          },
        ],
      });
    }

    const totalCents = Math.round(Number(validatedData.total));

    // Check for duplicate orders (same email and total within last 5 minutes)
    if (!confirmDuplicateOrder) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const duplicateOrder = await prisma.customer_order.findFirst({
        where: {
          email: validatedData.email,
          total: totalCents,
          dateTime: {
            gte: fiveMinutesAgo,
          },
        },
      });

      if (duplicateOrder) {
        console.log("❌ Duplicate order detected");
        return response.status(409).json({
          error: "Pedido duplicado detectado",
          code: "DUPLICATE_ORDER",
          details:
            "Um pedido com o mesmo e-mail e total foi criado recentemente. Aguarde antes de criar outro pedido.",
        });
      }
    }

    console.log("Creating order in database...");
    const orderCreateData = {
      id: randomUUID(),
      name: validatedData.name,
      lastname: validatedData.lastname,
      phone: validatedData.phone,
      email: validatedData.email,
      company: validatedData.company,
      adress: validatedData.adress,
      apartment: validatedData.apartment,
      postalCode: validatedData.postalCode,
      status: validatedData.status,
      city: validatedData.city,
      country: validatedData.country,
      orderNotice: validatedData.orderNotice,
      total: totalCents,
      dateTime: new Date(),
      deliveryOption: validatedData.deliveryOption || "entrega",
    };

    let corder;
    if (normalizedLineItems && normalizedLineItems.length > 0) {
      try {
        corder = await prisma.$transaction(async (tx) => {
          const order = await tx.customer_order.create({ data: orderCreateData });
          await createOrderLineItemsInTransaction(tx, order.id, normalizedLineItems);
          return order;
        });
      } catch (err) {
        if (err && err.code === "PRODUCT_NOT_FOUND") {
          return response.status(404).json({
            error: "Produto não encontrado",
            details: "Um ou mais itens referenciam produto inexistente.",
          });
        }
        throw err;
      }
    } else {
      corder = await prisma.customer_order.create({
        data: orderCreateData,
      });
    }

    console.log("✅ Order created successfully");
    console.log("Order ID:", corder.id);

    // Log successful order creation (for monitoring)
    console.log(
      `Order created successfully: ID ${corder.id}, Email: ${validatedData.email}, Total: $${validatedData.total}`,
    );

    const responseData = {
      id: corder.id,
      message: "Pedido criado com sucesso",
      orderNumber: corder.id,
    };

    console.log("Sending response:", responseData);
    recordIdempotentSuccess(idemKey, payloadHash, 201, responseData);
    return response.status(201).json(responseData);
  } catch (error) {
    console.error("❌ Error creating order:", error);

    // Handle specific Prisma errors
    if (error.code === "P2002") {
      return response.status(409).json({
        error: "Conflito ao criar pedido",
        details: "Já existe um pedido com essas informações",
      });
    }

    // Handle validation errors
    if (error instanceof ValidationError) {
      return response.status(400).json({
        error: "Falha na validação",
        details: [{ field: error.field, message: error.message }],
      });
    }

    // Generic error response
    return response.status(500).json({
      error: "Erro interno do servidor",
      details: "Não foi possível criar o pedido. Tente novamente mais tarde.",
    });
  }
}

async function updateCustomerOrder(request, response) {
  try {
    const { id } = request.params;

    // Validate ID format
    if (!id || typeof id !== "string") {
      return response.status(400).json({
        error: "ID do pedido inválido",
        details: "É necessário informar o ID do pedido",
      });
    }

    // Validate request body
    if (!request.body || typeof request.body !== "object") {
      return response.status(400).json({
        error: "Corpo da requisição inválido",
        details: "O corpo da requisição deve ser um objeto JSON válido",
      });
    }

    // Server-side validation for update data
    const validation = validateOrderData(request.body);

    if (!validation.isValid) {
      return response.status(400).json({
        error: "Falha na validação",
        details: validation.errors,
      });
    }

    const validatedData = validation.validatedData;

    const existingOrder = await prisma.customer_order.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingOrder) {
      return response.status(404).json({
        error: "Pedido não encontrado",
        details: "O pedido informado não existe",
      });
    }

    const updatedOrder = await prisma.customer_order.update({
      where: {
        id: existingOrder.id,
      },
      data: {
        name: validatedData.name,
        lastname: validatedData.lastname,
        phone: validatedData.phone,
        email: validatedData.email,
        company: validatedData.company,
        adress: validatedData.adress,
        apartment: validatedData.apartment,
        postalCode: validatedData.postalCode,
        status: validatedData.status,
        city: validatedData.city,
        country: validatedData.country,
        orderNotice: validatedData.orderNotice,
        total: validatedData.total,
        deliveryOption: validatedData.deliveryOption || "entrega",
      },
    });

    console.log(`Order updated successfully: ID ${updatedOrder.id}`);

    return response.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);

    if (error.code === "P2025") {
      return response.status(404).json({
        error: "Pedido não encontrado",
        details: "O pedido informado não existe",
      });
    }

    if (error instanceof ValidationError) {
      return response.status(400).json({
        error: "Falha na validação",
        details: [{ field: error.field, message: error.message }],
      });
    }

    return response.status(500).json({
      error: "Erro interno do servidor",
      details: "Não foi possível atualizar o pedido. Tente novamente mais tarde.",
    });
  }
}

async function deleteCustomerOrder(request, response) {
  try {
    const { id } = request.params;

    if (!id || typeof id !== "string") {
      return response.status(400).json({
        error: "ID do pedido inválido",
        details: "É necessário informar o ID do pedido",
      });
    }

    const existingOrder = await prisma.customer_order.findUnique({
      where: { id: id },
    });

    if (!existingOrder) {
      return response.status(404).json({
        error: "Pedido não encontrado",
        details: "O pedido informado não existe",
      });
    }

    await prisma.customer_order.delete({
      where: {
        id: id,
      },
    });

    console.log(`Order deleted successfully: ID ${id}`);
    return response.status(204).send();
  } catch (error) {
    console.error("Error deleting order:", error);

    if (error.code === "P2025") {
      return response.status(404).json({
        error: "Pedido não encontrado",
        details: "O pedido informado não existe",
      });
    }

    return response.status(500).json({
      error: "Erro interno do servidor",
      details: "Não foi possível excluir o pedido. Tente novamente mais tarde.",
    });
  }
}

async function getCustomerOrder(request, response) {
  try {
    const { id } = request.params;

    if (!id || typeof id !== "string") {
      return response.status(400).json({
        error: "ID do pedido inválido",
        details: "É necessário informar o ID do pedido",
      });
    }

    const order = await prisma.customer_order.findUnique({
      where: {
        id: id,
      },
    });

    if (!order) {
      return response.status(404).json({
        error: "Pedido não encontrado",
        details: "O pedido informado não existe",
      });
    }

    if (orderIncludesProductsQuery(request.query)) {
      const products = await fetchLineItemsByCustomerOrderId(id);
      return response.status(200).json({ ...order, products });
    }

    return response.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return response.status(500).json({
      error: "Erro interno do servidor",
      details: "Não foi possível carregar o pedido. Tente novamente mais tarde.",
    });
  }
}

async function getAllOrders(request, response) {
  try {
    // Add pagination and filtering for better performance
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return response.status(400).json({
        error: "Parâmetros de paginação inválidos",
        details: "A página deve ser >= 1 e o limite entre 1 e 100",
      });
    }

    const [orders, totalCount] = await Promise.all([
      prisma.customer_order.findMany({
        skip: offset,
        take: limit,
        orderBy: {
          dateTime: "desc",
        },
      }),
      prisma.customer_order.count(),
    ]);

    return response.json({
      orders,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return response.status(500).json({
      error: "Erro interno do servidor",
      details: "Não foi possível listar os pedidos. Tente novamente mais tarde.",
    });
  }
}

/** DELETE /api/orders/:orderId/items — remove todas as linhas (admin/dono). */
async function deleteAllOrderLineItemsForOrder(request, response) {
  try {
    const { orderId } = request.params;
    if (!orderId || typeof orderId !== "string") {
      return response.status(400).json({
        error: "ID do pedido inválido",
      });
    }
    await prisma.customer_order_product.deleteMany({
      where: { customerOrderId: orderId },
    });
    return response.status(204).send();
  } catch (error) {
    console.error("Error deleting order items:", error);
    return response.status(500).json({
      error: "Erro interno do servidor",
      details: "Não foi possível remover os itens do pedido.",
    });
  }
}

/** GET /api/orders/:orderId/items — lista linhas (mesmo payload que `products` em GET /api/orders/:id). */
async function getOrderLineItems(request, response) {
  try {
    const { orderId } = request.params;
    if (!orderId || typeof orderId !== "string") {
      return response.status(400).json({ error: "ID do pedido inválido" });
    }
    const lines = await fetchLineItemsByCustomerOrderId(orderId);
    return response.status(200).json(lines);
  } catch (error) {
    console.error("Error fetching order line items:", error);
    return response.status(500).json({
      error: "Erro interno do servidor",
      details: "Não foi possível carregar os itens do pedido.",
    });
  }
}

/** POST /api/orders/:orderId/items — adiciona linha (body como POST legado, sem customerOrderId obrigatório no JSON). */
function createOrderLineItemNested(request, response) {
  const { orderId } = request.params;
  if (!orderId) {
    return response.status(400).json({ error: "ID do pedido ausente" });
  }
  const base =
    request.body && typeof request.body === "object" && !Array.isArray(request.body)
      ? request.body
      : {};
  request.body = { ...base, customerOrderId: orderId };
  return createOrderProduct(request, response);
}

/** DELETE /api/orders/:orderId/items/:lineId — remove uma linha (valida pedido ↔ linha). */
async function deleteOrderLineItemNested(request, response) {
  try {
    const { orderId, lineId } = request.params;
    if (!orderId || !lineId) {
      return response.status(400).json({ error: "IDs inválidos" });
    }
    const line = await prisma.customer_order_product.findUnique({
      where: { id: lineId },
      select: { customerOrderId: true },
    });
    if (!line || line.customerOrderId !== orderId) {
      return response.status(404).json({
        error: "Item não encontrado",
        details: "O item não pertence a este pedido",
      });
    }
    await prisma.customer_order_product.delete({
      where: { id: lineId },
    });
    return response.status(204).send();
  } catch (error) {
    console.error("Error deleting order line:", error);
    return response.status(500).json({
      error: "Erro interno do servidor",
      details: "Não foi possível remover o item.",
    });
  }
}

module.exports = {
  createCustomerOrder,
  updateCustomerOrder,
  deleteCustomerOrder,
  getCustomerOrder,
  getAllOrders,
  getOrderLineItems,
  createOrderLineItemNested,
  getAllProductOrders,
  deleteAllOrderLineItemsForOrder,
  deleteOrderLineItemNested,
};
