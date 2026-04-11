const prisma = require("../utills/db");
const bcrypt = require("bcryptjs");
const { tokenUserId, normalizeEmail } = require("../middleware/auth");
const { asyncHandler, AppError } = require("../utills/errorHandler");

// Helper function to exclude password from user object
function excludePassword(user) {
  if (!user) return user;
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

const getAllUsers = asyncHandler(async (request, response) => {
  const users = await prisma.user.findMany({});
  // Exclude password from all users
  const usersWithoutPasswords = users.map((user) => excludePassword(user));
  return response.json(usersWithoutPasswords);
});

const createUser = asyncHandler(async (request, response) => {
  const { email, password } = request.body;

  // Basic validation
  if (!email || !password) {
    throw new AppError("E-mail e senha são obrigatórios", 400);
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError("Formato de e-mail inválido", 400);
  }

  // Password validation
  if (password.length < 8) {
    throw new AppError("A senha deve ter pelo menos 8 caracteres", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 14);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: "user",
    },
  });
  // Exclude password from response
  return response.status(201).json(excludePassword(user));
});

const updateUser = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const { email, password } = request.body;

  if (!id) {
    throw new AppError("ID do usuário é obrigatório", 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!existingUser) {
    throw new AppError("Usuário não encontrado", 404);
  }

  // Prepare update data
  const updateData = {};
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError("Formato de e-mail inválido", 400);
    }
    updateData.email = email;
  }
  if (password) {
    if (password.length < 8) {
      throw new AppError("A senha deve ter pelo menos 8 caracteres", 400);
    }
    updateData.password = await bcrypt.hash(password, 14);
  }
  const updatedUser = await prisma.user.update({
    where: {
      id: existingUser.id,
    },
    data: updateData,
  });

  // Exclude password from response
  return response.status(200).json(excludePassword(updatedUser));
});

const deleteUser = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("ID do usuário é obrigatório", 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!existingUser) {
    throw new AppError("Usuário não encontrado", 404);
  }

  await prisma.user.delete({
    where: {
      id: id,
    },
  });
  return response.status(204).send();
});

const getUser = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("ID do usuário é obrigatório", 400);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!user) {
    throw new AppError("Usuário não encontrado", 404);
  }

  // Exclude password from response
  return response.status(200).json(excludePassword(user));
});

/** GET /api/users/me — usuário da sessão JWT (sem expor lookup por e-mail). */
const getCurrentUser = asyncHandler(async (request, response) => {
  const uid = tokenUserId(request.auth);
  if (!uid) {
    throw new AppError("Sessão inválida", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: uid },
  });

  if (!user) {
    throw new AppError("Usuário não encontrado", 404);
  }

  return response.status(200).json(excludePassword(user));
});

// Get user profile with addresses and reviews
const getUserProfile = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("ID do usuário é obrigatório", 400);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
    include: {
      address: {
        orderBy: {
          isDefault: "desc",
        },
      },
      review: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              mainImage: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      wishlist: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              mainImage: true,
              price: true,
              slug: true,
            },
          },
        },
        orderBy: {
          id: "desc",
        },
      },
    },
  });

  if (!user) {
    throw new AppError("Usuário não encontrado", 404);
  }

  // Exclude password from response
  return response.status(200).json(excludePassword(user));
});

// Update user profile (excluding sensitive fields like password and role)
const updateUserProfile = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const { name, phone, cpf, photo, instagram } = request.body;

  if (!id) {
    throw new AppError("ID do usuário é obrigatório", 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!existingUser) {
    throw new AppError("Usuário não encontrado", 404);
  }

  // Prepare update data (only allow profile fields)
  const updateData = {};

  if (name !== undefined) {
    if (name && name.trim().length < 2) {
      throw new AppError("O nome deve ter pelo menos 2 caracteres", 400);
    }
    updateData.name = name?.trim() || null;
  }

  if (phone !== undefined) {
    if (phone && phone.trim().length < 10) {
      throw new AppError("O telefone deve ter pelo menos 10 caracteres", 400);
    }
    updateData.phone = phone?.trim() || null;
  }

  if (cpf !== undefined) {
    if (cpf && cpf.trim().length !== 11) {
      throw new AppError("O CPF deve ter exatamente 11 dígitos", 400);
    }
    updateData.cpf = cpf?.trim() || null;
  }

  if (photo !== undefined) {
    updateData.photo = photo?.trim() || null;
  }

  if (instagram !== undefined) {
    if (instagram && String(instagram).trim()) {
      const ig = String(instagram).trim();
      if (ig.length > 150) {
        throw new AppError("Instagram deve ter no máximo 150 caracteres", 400);
      }
      if (/[<>]/.test(ig)) {
        throw new AppError("Instagram contém caracteres inválidos", 400);
      }
      updateData.instagram = ig;
    } else {
      updateData.instagram = null;
    }
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: existingUser.id,
    },
    data: updateData,
    include: {
      address: {
        orderBy: {
          isDefault: "desc",
        },
      },
      review: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              mainImage: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      wishlist: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              mainImage: true,
              price: true,
              slug: true,
            },
          },
        },
        orderBy: {
          id: "desc",
        },
      },
    },
  });

  // Exclude password from response
  return response.status(200).json(excludePassword(updatedUser));
});

// Get user orders by email
const getUserOrders = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("ID do usuário é obrigatório", 400);
  }

  // Get user information
  let user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  /**
   * NextAuth grava o usuário no DB do Next (Vercel); o Express no Railway pode usar outro MySQL.
   * Nesse caso o `id` do JWT não existe aqui, mas o e-mail da sessão (req.auth) é o mesmo —
   * pedidos em `customer_order` são por e-mail, então resolvemos por e-mail quando possível.
   */
  const authEmail =
    request.auth?.email && typeof request.auth.email === "string"
      ? normalizeEmail(request.auth.email)
      : null;

  if (!user && authEmail) {
    user = await prisma.user.findFirst({
      where: { email: authEmail },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
  }

  let emailForOrders = user?.email ?? null;
  let responseUser = user;

  if (!emailForOrders && authEmail) {
    emailForOrders = authEmail;
    responseUser = { id, email: authEmail, name: null };
  }

  if (!emailForOrders || !responseUser) {
    throw new AppError("Usuário não encontrado", 404);
  }

  // Add pagination parameters
  const page = parseInt(request.query.page) || 1;
  const limit = parseInt(request.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Validate pagination parameters
  if (page < 1 || limit < 1 || limit > 50) {
    throw new AppError(
      "Parâmetros de paginação inválidos. A página deve ser >= 1 e o limite entre 1 e 50",
      400
    );
  }

  // Get orders by user email with products included
  const [orders, totalCount] = await Promise.all([
    prisma.customer_order.findMany({
      where: {
        email: emailForOrders,
      },
      select: {
        id: true,
        name: true,
        lastname: true,
        phone: true,
        email: true,
        company: true,
        adress: true,
        postalCode: true,
        dateTime: true,
        status: true,
        city: true,
        country: true,
        total: true,
        customer_order_product: {
          select: {
            id: true,
            quantity: true,
            product: {
              select: {
                id: true,
                title: true,
                mainImage: true,
                price: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        dateTime: "desc",
      },
      skip: offset,
      take: limit,
    }),
    prisma.customer_order.count({
      where: {
        email: emailForOrders,
      },
    }),
  ]);

  // Format the response
  const formattedOrders = orders.map((order) => ({
    id: order.id,
    name: order.name,
    lastname: order.lastname,
    phone: order.phone,
    email: order.email,
    company: order.company,
    address: {
      street: order.adress,
      apartment: null,
      postalCode: order.postalCode,
      city: order.city,
      country: order.country,
    },
    status: order.status,
    orderNotice: null,
    total: order.total,
    dateTime: order.dateTime,
    products: order.customer_order_product.map((orderProduct) => ({
      id: orderProduct.id,
      quantity: orderProduct.quantity,
      product: orderProduct.product,
    })),
  }));

  return response.json({
    user: {
      id: responseUser.id,
      email: responseUser.email,
      name: responseUser.name,
    },
    orders: formattedOrders,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
});

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getUser,
  getAllUsers,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  getUserOrders,
};
