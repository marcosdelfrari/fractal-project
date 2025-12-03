const prisma = require("../utills/db");
const { asyncHandler, AppError } = require("../utills/errorHandler");
const { orderValidation } = require("../utills/validation");

// Get all addresses for a user
const getUserAddresses = asyncHandler(async (request, response) => {
  const { userId } = request.params;

  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return response.json(addresses);
});

// Get a specific address
const getAddress = asyncHandler(async (request, response) => {
  const { addressId } = request.params;

  if (!addressId) {
    throw new AppError("Address ID is required", 400);
  }

  const address = await prisma.address.findUnique({
    where: { id: addressId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  if (!address) {
    throw new AppError("Address not found", 404);
  }

  return response.json(address);
});

// Create a new address
const createAddress = asyncHandler(async (request, response) => {
  const { userId } = request.params;
  const {
    label,
    street,
    number,
    complement,
    district,
    city,
    state,
    zipCode,
    country = "Brasil",
    isDefault = false,
  } = request.body;

  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Validate required fields
  if (
    !label ||
    !street ||
    !number ||
    !district ||
    !city ||
    !state ||
    !zipCode
  ) {
    throw new AppError(
      "Label, street, number, district, city, state, and zipCode are required",
      400
    );
  }

  // Validate field lengths and formats
  const validatedLabel = label.trim();
  if (validatedLabel.length < 2 || validatedLabel.length > 50) {
    throw new AppError("Label must be between 2 and 50 characters", 400);
  }

  const validatedStreet = orderValidation.validateAddress(street, "street");
  const validatedNumber = number.trim();
  if (validatedNumber.length < 1 || validatedNumber.length > 20) {
    throw new AppError("Number must be between 1 and 20 characters", 400);
  }

  const validatedDistrict = orderValidation.validateAddress(
    district,
    "district"
  );
  const validatedCity = orderValidation.validateAddress(city, "city");
  const validatedState = orderValidation.validateAddress(state, "state");
  const validatedZipCode = orderValidation.validatePostalCode(zipCode);

  // Validate complement if provided
  let validatedComplement = null;
  if (complement && complement.trim()) {
    validatedComplement = complement.trim();
    if (validatedComplement.length > 100) {
      throw new AppError("Complement must be less than 100 characters", 400);
    }
  }

  // Validate country
  const validatedCountry = country.trim();
  if (validatedCountry.length < 2 || validatedCountry.length > 50) {
    throw new AppError("Country must be between 2 and 50 characters", 400);
  }

  // If this is set as default, unset other default addresses
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId,
      label: validatedLabel,
      street: validatedStreet,
      number: validatedNumber,
      complement: validatedComplement,
      district: validatedDistrict,
      city: validatedCity,
      state: validatedState,
      zipCode: validatedZipCode,
      country: validatedCountry,
      isDefault,
    },
  });

  return response.status(201).json(address);
});

// Update an address
const updateAddress = asyncHandler(async (request, response) => {
  const { addressId } = request.params;
  const {
    label,
    street,
    number,
    complement,
    district,
    city,
    state,
    zipCode,
    country,
    isDefault,
  } = request.body;

  if (!addressId) {
    throw new AppError("Address ID is required", 400);
  }

  // Find existing address
  const existingAddress = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!existingAddress) {
    throw new AppError("Address not found", 404);
  }

  // Prepare update data
  const updateData = {};

  if (label !== undefined) {
    const validatedLabel = label.trim();
    if (validatedLabel.length < 2 || validatedLabel.length > 50) {
      throw new AppError("Label must be between 2 and 50 characters", 400);
    }
    updateData.label = validatedLabel;
  }

  if (street !== undefined) {
    updateData.street = orderValidation.validateAddress(street, "street");
  }

  if (number !== undefined) {
    const validatedNumber = number.trim();
    if (validatedNumber.length < 1 || validatedNumber.length > 20) {
      throw new AppError("Number must be between 1 and 20 characters", 400);
    }
    updateData.number = validatedNumber;
  }

  if (complement !== undefined) {
    if (complement && complement.trim()) {
      const validatedComplement = complement.trim();
      if (validatedComplement.length > 100) {
        throw new AppError("Complement must be less than 100 characters", 400);
      }
      updateData.complement = validatedComplement;
    } else {
      updateData.complement = null;
    }
  }

  if (district !== undefined) {
    updateData.district = orderValidation.validateAddress(district, "district");
  }

  if (city !== undefined) {
    updateData.city = orderValidation.validateAddress(city, "city");
  }

  if (state !== undefined) {
    updateData.state = orderValidation.validateAddress(state, "state");
  }

  if (zipCode !== undefined) {
    updateData.zipCode = orderValidation.validatePostalCode(zipCode);
  }

  if (country !== undefined) {
    const validatedCountry = country.trim();
    if (validatedCountry.length < 2 || validatedCountry.length > 50) {
      throw new AppError("Country must be between 2 and 50 characters", 400);
    }
    updateData.country = validatedCountry;
  }

  if (isDefault !== undefined) {
    updateData.isDefault = Boolean(isDefault);

    // If setting as default, unset other default addresses for this user
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: existingAddress.userId,
          id: { not: addressId },
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }
  }

  const updatedAddress = await prisma.address.update({
    where: { id: addressId },
    data: updateData,
  });

  return response.json(updatedAddress);
});

// Delete an address
const deleteAddress = asyncHandler(async (request, response) => {
  const { addressId } = request.params;

  if (!addressId) {
    throw new AppError("Address ID is required", 400);
  }

  const existingAddress = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!existingAddress) {
    throw new AppError("Address not found", 404);
  }

  await prisma.address.delete({
    where: { id: addressId },
  });

  return response.status(204).send();
});

// Set address as default
const setDefaultAddress = asyncHandler(async (request, response) => {
  const { addressId } = request.params;

  if (!addressId) {
    throw new AppError("Address ID is required", 400);
  }

  const existingAddress = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!existingAddress) {
    throw new AppError("Address not found", 404);
  }

  // Unset all other default addresses for this user
  await prisma.address.updateMany({
    where: {
      userId: existingAddress.userId,
      id: { not: addressId },
      isDefault: true,
    },
    data: { isDefault: false },
  });

  // Set this address as default
  const updatedAddress = await prisma.address.update({
    where: { id: addressId },
    data: { isDefault: true },
  });

  return response.json(updatedAddress);
});

module.exports = {
  getUserAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
