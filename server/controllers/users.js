const prisma = require("../utills/db");
const bcrypt = require("bcryptjs");
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
  const { email, password, role } = request.body;

  // Basic validation
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError("Invalid email format", 400);
  }

  // Password validation
  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters long", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 14);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: role || "user",
    },
  });
  // Exclude password from response
  return response.status(201).json(excludePassword(user));
});

const updateUser = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const { email, password, role } = request.body;

  if (!id) {
    throw new AppError("User ID is required", 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  // Prepare update data
  const updateData = {};
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError("Invalid email format", 400);
    }
    updateData.email = email;
  }
  if (password) {
    if (password.length < 8) {
      throw new AppError("Password must be at least 8 characters long", 400);
    }
    updateData.password = await bcrypt.hash(password, 14);
  }
  if (role) {
    updateData.role = role;
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
    throw new AppError("User ID is required", 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!existingUser) {
    throw new AppError("User not found", 404);
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
    throw new AppError("User ID is required", 400);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Exclude password from response
  return response.status(200).json(excludePassword(user));
});

const getUserByEmail = asyncHandler(async (request, response) => {
  const { email } = request.params;

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Exclude password from response
  return response.status(200).json(excludePassword(user));
});

// Get user profile with addresses and reviews
const getUserProfile = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("User ID is required", 400);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
    include: {
      addresses: {
        orderBy: {
          isDefault: "desc",
        },
      },
      reviews: {
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
      Wishlist: {
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
    throw new AppError("User not found", 404);
  }

  // Exclude password from response
  return response.status(200).json(excludePassword(user));
});

// Update user profile (excluding sensitive fields like password and role)
const updateUserProfile = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const { name, phone, cpf, photo } = request.body;

  if (!id) {
    throw new AppError("User ID is required", 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  // Prepare update data (only allow profile fields)
  const updateData = {};

  if (name !== undefined) {
    if (name && name.trim().length < 2) {
      throw new AppError("Name must be at least 2 characters long", 400);
    }
    updateData.name = name?.trim() || null;
  }

  if (phone !== undefined) {
    if (phone && phone.trim().length < 10) {
      throw new AppError("Phone must be at least 10 characters long", 400);
    }
    updateData.phone = phone?.trim() || null;
  }

  if (cpf !== undefined) {
    if (cpf && cpf.trim().length !== 11) {
      throw new AppError("CPF must be exactly 11 digits", 400);
    }
    updateData.cpf = cpf?.trim() || null;
  }

  if (photo !== undefined) {
    updateData.photo = photo?.trim() || null;
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: existingUser.id,
    },
    data: updateData,
    include: {
      addresses: {
        orderBy: {
          isDefault: "desc",
        },
      },
      reviews: {
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
      Wishlist: {
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
    throw new AppError("User ID is required", 400);
  }

  // Get user information
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Add pagination parameters
  const page = parseInt(request.query.page) || 1;
  const limit = parseInt(request.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Validate pagination parameters
  if (page < 1 || limit < 1 || limit > 50) {
    throw new AppError(
      "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 50",
      400
    );
  }

  // Get orders by user email with products included
  const [orders, totalCount] = await Promise.all([
    prisma.customer_order.findMany({
      where: {
        email: user.email,
      },
      include: {
        products: {
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
        email: user.email,
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
      apartment: order.apartment,
      postalCode: order.postalCode,
      city: order.city,
      country: order.country,
    },
    status: order.status,
    orderNotice: order.orderNotice,
    total: order.total,
    dateTime: order.dateTime,
    products: order.products.map((orderProduct) => ({
      id: orderProduct.id,
      quantity: orderProduct.quantity,
      product: orderProduct.product,
    })),
  }));

  return response.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
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
  getUserByEmail,
  getUserProfile,
  updateUserProfile,
  getUserOrders,
};
