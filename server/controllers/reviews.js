const prisma = require("../utills/db");
const { asyncHandler, AppError } = require("../utills/errorHandler");

// Get all reviews for a product
const getProductReviews = asyncHandler(async (request, response) => {
  const { productId } = request.params;

  if (!productId) {
    throw new AppError("Product ID is required", 400);
  }

  // Verify product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, title: true },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
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

  const [reviews, totalCount] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            photo: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    }),
    prisma.review.count({
      where: { productId },
    }),
  ]);

  // Calculate average rating
  const averageRating = await prisma.review.aggregate({
    where: { productId },
    _avg: {
      rating: true,
    },
  });

  return response.json({
    product: {
      id: product.id,
      title: product.title,
    },
    reviews,
    averageRating: averageRating._avg.rating || 0,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
});

// Get a specific review
const getReview = asyncHandler(async (request, response) => {
  const { reviewId } = request.params;

  if (!reviewId) {
    throw new AppError("Review ID is required", 400);
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          photo: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
          mainImage: true,
          slug: true,
        },
      },
    },
  });

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  return response.json(review);
});

// Create a new review
const createReview = asyncHandler(async (request, response) => {
  const { userId, productId, rating, comment } = request.body;

  if (!userId || !productId || !rating) {
    throw new AppError("User ID, Product ID, and rating are required", 400);
  }

  // Validate rating
  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    throw new AppError("Rating must be an integer between 1 and 5", 400);
  }

  // Validate comment if provided
  let validatedComment = null;
  if (comment !== undefined) {
    if (comment && comment.trim()) {
      validatedComment = comment.trim();
      if (validatedComment.length > 1000) {
        throw new AppError("Comment must be less than 1000 characters", 400);
      }
    }
  }

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Verify product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, title: true },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // Check if user already reviewed this product
  const existingReview = await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existingReview) {
    throw new AppError(
      "You have already reviewed this product. You can only review each product once.",
      409
    );
  }

  const review = await prisma.review.create({
    data: {
      userId,
      productId,
      rating,
      comment: validatedComment,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          photo: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
          mainImage: true,
          slug: true,
        },
      },
    },
  });

  return response.status(201).json(review);
});

// Update a review
const updateReview = asyncHandler(async (request, response) => {
  const { reviewId } = request.params;
  const { rating, comment } = request.body;

  if (!reviewId) {
    throw new AppError("Review ID is required", 400);
  }

  // Find existing review
  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          photo: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
          mainImage: true,
          slug: true,
        },
      },
    },
  });

  if (!existingReview) {
    throw new AppError("Review not found", 404);
  }

  // Prepare update data
  const updateData = {};

  if (rating !== undefined) {
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      throw new AppError("Rating must be an integer between 1 and 5", 400);
    }
    updateData.rating = rating;
  }

  if (comment !== undefined) {
    if (comment && comment.trim()) {
      const validatedComment = comment.trim();
      if (validatedComment.length > 1000) {
        throw new AppError("Comment must be less than 1000 characters", 400);
      }
      updateData.comment = validatedComment;
    } else {
      updateData.comment = null;
    }
  }

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          photo: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
          mainImage: true,
          slug: true,
        },
      },
    },
  });

  return response.json(updatedReview);
});

// Delete a review
const deleteReview = asyncHandler(async (request, response) => {
  const { reviewId } = request.params;

  if (!reviewId) {
    throw new AppError("Review ID is required", 400);
  }

  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!existingReview) {
    throw new AppError("Review not found", 404);
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });

  return response.status(204).send();
});

// Get user's reviews
const getUserReviews = asyncHandler(async (request, response) => {
  const { userId } = request.params;

  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
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

  const [reviews, totalCount] = await Promise.all([
    prisma.review.findMany({
      where: { userId },
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
      skip: offset,
      take: limit,
    }),
    prisma.review.count({
      where: { userId },
    }),
  ]);

  return response.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    reviews,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
});

module.exports = {
  getProductReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
};
