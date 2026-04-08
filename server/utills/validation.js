// Server-side validation utilities for payment and order processing
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Validation error class
class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

const orderFieldLabel = (field) => {
  const map = {
    name: "Nome",
    lastname: "Sobrenome",
    email: "E-mail",
    phone: "Telefone",
    company: "Empresa",
    address: "Endereço",
    street: "Rua/Avenida",
    district: "Bairro",
    state: "Estado (UF)",
    apartment: "Complemento",
    city: "Cidade",
    country: "País",
    postalCode: "CEP",
    total: "Total",
    status: "Status",
    orderNotice: "Observações",
  };
  return map[field] || field;
};

// Payment validation utilities
const paymentValidation = {
  // Validate credit card number using Luhn algorithm
  validateCardNumber: (cardNumber) => {
    if (!cardNumber || typeof cardNumber !== "string") {
      throw new ValidationError("Número do cartão é obrigatório", "cardNumber");
    }

    // Remove all non-digit characters
    const cleanedNumber = cardNumber.replace(/[^0-9]/g, "");

    // Check length (13-19 digits)
    if (cleanedNumber.length < 13 || cleanedNumber.length > 19) {
      throw new ValidationError(
        "O número do cartão deve ter entre 13 e 19 dígitos",
        "cardNumber",
      );
    }

    // Luhn algorithm validation
    let sum = 0;
    let isEven = false;

    for (let i = cleanedNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanedNumber[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    if (sum % 10 !== 0) {
      throw new ValidationError("Número do cartão inválido", "cardNumber");
    }

    return cleanedNumber;
  },

  // Validate CVV/CVC
  validateCVV: (cvv, cardNumber) => {
    if (!cvv || typeof cvv !== "string") {
      throw new ValidationError("CVV é obrigatório", "cvv");
    }

    const cleanedCVV = cvv.replace(/[^0-9]/g, "");

    // American Express cards have 4-digit CVV, others have 3-digit
    const cleanedCardNumber = cardNumber
      ? cardNumber.replace(/[^0-9]/g, "")
      : "";
    const isAmex =
      cleanedCardNumber.startsWith("34") || cleanedCardNumber.startsWith("37");
    const expectedLength = isAmex ? 4 : 3;

    if (cleanedCVV.length !== expectedLength) {
      throw new ValidationError(
        `O CVV deve ter ${expectedLength} dígitos`,
        "cvv",
      );
    }

    if (!/^[0-9]+$/.test(cleanedCVV)) {
      throw new ValidationError("O CVV deve conter apenas números", "cvv");
    }

    return cleanedCVV;
  },

  // Validate expiration date
  validateExpirationDate: (expDate) => {
    if (!expDate || typeof expDate !== "string") {
      throw new ValidationError("Data de validade é obrigatória", "expDate");
    }

    // Accept MM/YY, MM/YYYY, MM-YY, MM-YYYY formats
    const cleanedDate = expDate.replace(/[^0-9]/g, "");

    if (cleanedDate.length !== 4 && cleanedDate.length !== 6) {
      throw new ValidationError(
        "A data de validade deve estar no formato MM/AA ou MM/AAAA",
        "expDate",
      );
    }

    const month = parseInt(cleanedDate.substring(0, 2));
    const year = parseInt(cleanedDate.substring(2));
    const fullYear = year < 100 ? 2000 + year : year;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    if (month < 1 || month > 12) {
      throw new ValidationError("Mês inválido na data de validade", "expDate");
    }

    if (
      fullYear < currentYear ||
      (fullYear === currentYear && month < currentMonth)
    ) {
      throw new ValidationError("Cartão vencido", "expDate");
    }

    return { month, year: fullYear };
  },

  // Validate cardholder name
  validateCardholderName: (name) => {
    if (!name || typeof name !== "string") {
      throw new ValidationError(
        "Nome do titular do cartão é obrigatório",
        "cardholderName",
      );
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      throw new ValidationError(
        "O nome do titular deve ter pelo menos 2 caracteres",
        "cardholderName",
      );
    }

    if (trimmedName.length > 50) {
      throw new ValidationError(
        "O nome do titular deve ter menos de 50 caracteres",
        "cardholderName",
      );
    }

    // Allow letters, spaces, hyphens, and apostrophes
    if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) {
      throw new ValidationError(
        "O nome do titular contém caracteres inválidos",
        "cardholderName",
      );
    }

    return trimmedName;
  },
};

// Order validation utilities
const orderValidation = {
  // Validate email format - FIXED: Check XSS patterns first
  validateEmail: (email) => {
    if (!email || typeof email !== "string") {
      throw new ValidationError("E-mail é obrigatório", "email");
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check for suspicious patterns FIRST (before format validation)
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:/i,
    ];

    if (suspiciousPatterns.some((pattern) => pattern.test(trimmedEmail))) {
      throw new ValidationError("E-mail contém caracteres inválidos", "email");
    }

    if (trimmedEmail.length > 254) {
      throw new ValidationError(
        "O e-mail deve ter menos de 254 caracteres",
        "email",
      );
    }

    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(trimmedEmail)) {
      throw new ValidationError("Formato de e-mail inválido", "email");
    }

    return trimmedEmail;
  },

  // Validate name format
  validateName: (name, fieldName = "name") => {
    const label = orderFieldLabel(fieldName);
    if (!name || typeof name !== "string") {
      throw new ValidationError(`${label} é obrigatório`, fieldName);
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      throw new ValidationError(
        `${label} deve ter pelo menos 2 caracteres`,
        fieldName,
      );
    }

    if (trimmedName.length > 50) {
      throw new ValidationError(
        `${label} deve ter menos de 50 caracteres`,
        fieldName,
      );
    }

    // Allow letters, spaces, hyphens, and apostrophes
    if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) {
      throw new ValidationError(
        `${label} contém caracteres inválidos`,
        fieldName,
      );
    }

    return trimmedName;
  },

  // Validate phone number
  validatePhone: (phone) => {
    if (!phone || typeof phone !== "string") {
      throw new ValidationError("Telefone é obrigatório", "phone");
    }

    const cleanedPhone = phone.replace(/[^0-9+\-\(\)\s]/g, "");

    if (cleanedPhone.length < 10) {
      throw new ValidationError(
        "O telefone deve ter pelo menos 10 dígitos",
        "phone",
      );
    }

    if (cleanedPhone.length > 20) {
      throw new ValidationError(
        "O telefone deve ter menos de 20 caracteres",
        "phone",
      );
    }

    return cleanedPhone;
  },

  // Validate address fields - UPDATED for apartment (1 character minimum)
  validateAddress: (address, fieldName = "address") => {
    const label = orderFieldLabel(fieldName);
    if (!address || typeof address !== "string") {
      throw new ValidationError(`${label} é obrigatório`, fieldName);
    }

    const trimmedAddress = address.trim();

    // apartment: mín. 1; UF (ViaCEP): 2 letras; demais campos de endereço: mín. 5
    const minLength =
      fieldName === "apartment"
        ? 1
        : fieldName === "state"
          ? 2
          : 5;

    if (trimmedAddress.length < minLength) {
      throw new ValidationError(
        `${label} deve ter pelo menos ${minLength} caracteres`,
        fieldName,
      );
    }

    if (trimmedAddress.length > 200) {
      throw new ValidationError(
        `${label} deve ter menos de 200 caracteres`,
        fieldName,
      );
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:/i,
    ];

    if (suspiciousPatterns.some((pattern) => pattern.test(trimmedAddress))) {
      throw new ValidationError(
        `${label} contém caracteres inválidos`,
        fieldName,
      );
    }

    return trimmedAddress;
  },

  // Validate postal code
  validatePostalCode: (postalCode) => {
    if (!postalCode || typeof postalCode !== "string") {
      throw new ValidationError("CEP é obrigatório", "postalCode");
    }

    const trimmedCode = postalCode.trim();

    if (trimmedCode.length < 3) {
      throw new ValidationError(
        "O CEP deve ter pelo menos 3 caracteres",
        "postalCode",
      );
    }

    if (trimmedCode.length > 20) {
      throw new ValidationError(
        "O CEP deve ter menos de 20 caracteres",
        "postalCode",
      );
    }

    return trimmedCode;
  },

  // Validate total amount
  validateTotal: (total) => {
    if (total === null || total === undefined) {
      throw new ValidationError("Valor total é obrigatório", "total");
    }

    const numTotal = parseFloat(total);

    if (isNaN(numTotal)) {
      throw new ValidationError("O total deve ser um número válido", "total");
    }

    if (numTotal <= 0) {
      throw new ValidationError("O total deve ser maior que zero", "total");
    }

    if (numTotal > 999999.99) {
      throw new ValidationError("Valor total muito alto", "total");
    }

    return Math.round(numTotal * 100) / 100; // Round to 2 decimal places
  },

  /** Observações do pedido (opcional); máx. 500 caracteres UTF-8. */
  validateOrderNotice: (notice) => {
    if (notice == null || notice === "") {
      return "";
    }
    if (typeof notice !== "string") {
      throw new ValidationError("Observações do pedido inválidas", "orderNotice");
    }
    const t = notice.trim();
    if (t.length > 500) {
      throw new ValidationError(
        "Observações do pedido devem ter no máximo 500 caracteres",
        "orderNotice",
      );
    }
    return t;
  },

  // Validate order status
  validateStatus: (status) => {
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "ready_for_pickup",
      "delivered",
      "cancelled",
    ];

    if (!status || typeof status !== "string") {
      throw new ValidationError("Status do pedido é obrigatório", "status");
    }

    if (!validStatuses.includes(status.toLowerCase())) {
      throw new ValidationError(
        `Status do pedido inválido. Valores permitidos: ${validStatuses.join(", ")}`,
        "status",
      );
    }

    return status.toLowerCase();
  },
};

// Comprehensive order validation - FIXED VERSION
const validateOrderData = (orderData) => {
  const errors = [];
  const validatedData = {};
  const isPickup = orderData?.deliveryOption === "retirada";

  // Helper function to safely validate a field
  const safeValidate = (validationFn, value, fieldName) => {
    try {
      return validationFn(value, fieldName);
    } catch (error) {
      if (error instanceof ValidationError) {
        errors.push({
          field: error.field,
          message: error.message,
        });
        return null;
      } else {
        errors.push({
          field: fieldName,
          message: "Ocorreu um erro de validação",
        });
        return null;
      }
    }
  };

  // Validate all required fields - ALL will be checked regardless of previous errors
  validatedData.name = safeValidate(
    orderValidation.validateName,
    orderData.name,
    "name",
  );
  validatedData.lastname = safeValidate(
    orderValidation.validateName,
    orderData.lastname,
    "lastname",
  );
  validatedData.email = safeValidate(
    orderValidation.validateEmail,
    orderData.email,
    "email",
  );
  validatedData.phone = safeValidate(
    orderValidation.validatePhone,
    orderData.phone,
    "phone",
  );
  validatedData.company = safeValidate(
    orderValidation.validateAddress,
    isPickup ? orderData.company || "Retirada" : orderData.company,
    "company",
  );
  validatedData.adress = safeValidate(
    orderValidation.validateAddress,
    isPickup ? orderData.adress || "Retirada no balcão" : orderData.adress,
    "address",
  );
  validatedData.apartment = safeValidate(
    orderValidation.validateAddress,
    isPickup ? orderData.apartment || "Retirada" : orderData.apartment,
    "apartment",
  );
  validatedData.city = safeValidate(
    orderValidation.validateAddress,
    isPickup ? orderData.city || "Retirada" : orderData.city,
    "city",
  );
  validatedData.country = safeValidate(
    orderValidation.validateAddress,
    isPickup ? orderData.country || "Brasil" : orderData.country,
    "country",
  );
  validatedData.postalCode = safeValidate(
    orderValidation.validatePostalCode,
    isPickup ? orderData.postalCode || "00000-000" : orderData.postalCode,
    "postalCode",
  );
  validatedData.total = safeValidate(
    orderValidation.validateTotal,
    orderData.total,
    "total",
  );
  validatedData.status = safeValidate(
    orderValidation.validateStatus,
    orderData.status || "pending",
    "status",
  );

  validatedData.orderNotice = safeValidate(
    orderValidation.validateOrderNotice,
    orderData.orderNotice,
    "orderNotice",
  );

  validatedData.deliveryOption =
    orderData?.deliveryOption === "retirada" ? "retirada" : "entrega";

  return {
    isValid: errors.length === 0,
    errors,
    validatedData,
  };
};

/**
 * Itens do pedido em POST /api/orders agregado (`items`: array).
 * @returns {{ isValid: boolean, errors: Array<{ field: string, message: string }>, normalizedItems: Array<{ productId: string, quantity: number, selectedColor: string|null, selectedSize: string|null }> }}
 */
const validateOrderItemsPayload = (items) => {
  const errors = [];
  if (!Array.isArray(items)) {
    return {
      isValid: false,
      errors: [{ field: "items", message: "items deve ser um array" }],
      normalizedItems: [],
    };
  }
  if (items.length === 0) {
    return {
      isValid: false,
      errors: [{ field: "items", message: "items não pode ser vazio quando informado" }],
      normalizedItems: [],
    };
  }
  if (items.length > 100) {
    return {
      isValid: false,
      errors: [{ field: "items", message: "no máximo 100 itens por pedido" }],
      normalizedItems: [],
    };
  }

  const normalizedItems = [];
  for (let i = 0; i < items.length; i++) {
    const row = items[i];
    if (!row || typeof row !== "object") {
      errors.push({ field: `items[${i}]`, message: "item inválido" });
      continue;
    }
    const productId =
      typeof row.productId === "string" ? row.productId.trim() : "";
    if (!productId) {
      errors.push({
        field: `items[${i}].productId`,
        message: "productId é obrigatório",
      });
      continue;
    }
    const quantity = parseInt(row.quantity, 10);
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 99999) {
      errors.push({
        field: `items[${i}].quantity`,
        message: "quantidade deve ser entre 1 e 99999",
      });
      continue;
    }
    const selectedColor =
      typeof row.selectedColor === "string"
        ? row.selectedColor.trim() || null
        : null;
    const selectedSize =
      typeof row.selectedSize === "string"
        ? row.selectedSize.trim() || null
        : null;
    normalizedItems.push({
      productId,
      quantity,
      selectedColor,
      selectedSize,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    normalizedItems,
  };
};

// Payment data validation (for future payment integration)
const validatePaymentData = (paymentData) => {
  const errors = [];
  const validatedData = {};

  // Helper function to safely validate payment fields
  const safeValidatePayment = (validationFn, value, fieldName) => {
    try {
      return validationFn(value, paymentData.cardNumber);
    } catch (error) {
      if (error instanceof ValidationError) {
        errors.push({
          field: error.field,
          message: error.message,
        });
        return null;
      } else {
        errors.push({
          field: fieldName,
          message: "Ocorreu um erro na validação do pagamento",
        });
        return null;
      }
    }
  };

  if (paymentData.cardNumber) {
    validatedData.cardNumber = safeValidatePayment(
      paymentValidation.validateCardNumber,
      paymentData.cardNumber,
      "cardNumber",
    );
  }

  if (paymentData.cvv) {
    validatedData.cvv = safeValidatePayment(
      paymentValidation.validateCVV,
      paymentData.cvv,
      "cvv",
    );
  }

  if (paymentData.expDate) {
    try {
      validatedData.expDate = paymentValidation.validateExpirationDate(
        paymentData.expDate,
      );
    } catch (error) {
      if (error instanceof ValidationError) {
        errors.push({
          field: error.field,
          message: error.message,
        });
      }
    }
  }

  if (paymentData.cardholderName) {
    try {
      validatedData.cardholderName = paymentValidation.validateCardholderName(
        paymentData.cardholderName,
      );
    } catch (error) {
      if (error instanceof ValidationError) {
        errors.push({
          field: error.field,
          message: error.message,
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    validatedData,
  };
};

module.exports = {
  ValidationError,
  paymentValidation,
  orderValidation,
  validateOrderData,
  validateOrderItemsPayload,
  validatePaymentData,
};
