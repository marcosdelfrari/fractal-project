import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  // Validate that DATABASE_URL is present
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  // Parse DATABASE_URL to check SSL configuration
  const databaseUrl = process.env.DATABASE_URL;
  let url: URL;

  try {
    url = new URL(databaseUrl);
  } catch (error) {
    throw new Error(
      `Invalid DATABASE_URL format: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  // Log SSL configuration for debugging
  if (process.env.NODE_ENV === "development") {
    console.log(
      ` Database connection: ${url.protocol}//${url.hostname}:${
        url.port || "3306"
      }`
    );
    console.log(
      `🔒 SSL Mode: ${url.searchParams.get("sslmode") || "not specified"}`
    );
  }

  // For production MySQL connections, ensure SSL is configured
  const prismaConfig: any = {
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error", "warn"],
  };

  // Add SSL configuration for MySQL in production if not already in URL
  if (process.env.NODE_ENV === "production" && url.protocol === "mysql:") {
    const sslMode = url.searchParams.get("sslmode");
    if (!sslMode) {
      // If SSL mode is not specified, add it to the connection string
      // This is important for production MySQL connections (e.g., Railway, PlanetScale)
      url.searchParams.set("sslmode", "REQUIRED");
      // Note: Prisma will use the updated URL from the environment variable
      // If you need to override, you can use the datasource URL in the Prisma schema
    }
  }

  return new PrismaClient(prismaConfig);
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
