// Server-side error handler for Express.js
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Server-side error logging
const logError = (error, context = '') => {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` [${context}]` : '';
  
  if (error instanceof AppError) {
    console.error(`${timestamp}${contextStr} AppError:`, {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack
    });
  } else if (error instanceof Error) {
    console.error(`${timestamp}${contextStr} Error:`, {
      message: error.message,
      stack: error.stack
    });
  } else {
    console.error(`${timestamp}${contextStr} Unknown error:`, error);
  }
};

// Enhanced Prisma error handling for server
const handlePrismaError = (error) => {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return {
      error: "Erro interno do servidor. Tente novamente mais tarde.",
      timestamp: new Date().toISOString()
    };
  }

  const prismaError = error;
  
  switch (prismaError.code) {
    case 'P2002':
      return {
        error: "Já existe um registro com essas informações",
        details: prismaError.meta?.target ? `Campo: ${prismaError.meta.target.join(', ')}` : undefined,
        timestamp: new Date().toISOString()
      };
    case 'P2025':
      return {
        error: "Registro não encontrado",
        timestamp: new Date().toISOString()
      };
    case 'P2003':
      return {
        error: "Violação de chave estrangeira",
        timestamp: new Date().toISOString()
      };
    case 'P2014':
      return {
        error: "Esta alteração violaria uma relação obrigatória no banco de dados",
        timestamp: new Date().toISOString()
      };
    case 'P2021':
      return {
        error: "A tabela não existe no banco de dados atual",
        timestamp: new Date().toISOString()
      };
    case 'P2022':
      return {
        error: "A coluna não existe no banco de dados atual",
        timestamp: new Date().toISOString()
      };
    default:
      return {
        error: "Falha na operação no banco de dados",
        details: `Código do erro: ${prismaError.code}`,
        timestamp: new Date().toISOString()
      };
  }
};

// Get status code from Prisma error
const getStatusCodeFromPrismaError = (error) => {
  switch (error.code) {
    case 'P2002':
      return 409; // Conflict
    case 'P2025':
      return 404; // Not Found
    case 'P2003':
    case 'P2014':
      return 400; // Bad Request
    case 'P2021':
    case 'P2022':
      return 500; // Internal Server Error
    default:
      return 500;
  }
};

// Server-side error handler
const handleServerError = (error, res, context = '') => {
  const timestamp = new Date().toISOString();
  
  // Log the error
  logError(error, context);

  // Custom application errors
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: error.message,
      timestamp
    });
    return;
  }

  // Validação de domínio (ex.: endereços, pedidos)
  if (error && error.name === "ValidationError") {
    res.status(400).json({
      error: error.message,
      field: error.field ?? undefined,
      timestamp
    });
    return;
  }

  // Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const errorResponse = handlePrismaError(error);
    const statusCode = getStatusCodeFromPrismaError(error);
    
    res.status(statusCode).json(errorResponse);
    return;
  }

  // Generic server error
  res.status(500).json({
    error: "Erro interno do servidor. Tente novamente mais tarde.",
    timestamp
  });
};

// Async wrapper for server functions
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      handleServerError(error, res, `${req.method} ${req.path}`);
    });
  };
};

module.exports = {
  AppError,
  logError,
  handlePrismaError,
  getStatusCodeFromPrismaError,
  handleServerError,
  asyncHandler
};

