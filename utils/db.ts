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
      }`,
    );
  }

  // Log SSL configuration for debugging
  if (process.env.NODE_ENV === "development") {
    console.log(
      ` Database connection: ${url.protocol}//${url.hostname}:${
        url.port || "3306"
      }`,
    );
    console.log(
      `🔒 MySQL sslaccept: ${url.searchParams.get("sslaccept") || "not specified"}`,
    );
  }

  const prismaConfig: any = {
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error", "warn"],
  };

  let resolvedUrl = databaseUrl;

  // MySQL (Prisma): usar sslaccept, não sslmode (isso é do PostgreSQL).
  // Sem isso, Vercel → Railway MySQL costuma falhar (P1001 / SSL / certificado).
  if (process.env.NODE_ENV === "production" && url.protocol === "mysql:") {
    url.searchParams.delete("sslmode");
    if (!url.searchParams.has("sslaccept")) {
      url.searchParams.set("sslaccept", "accept_invalid_certs");
    }
    resolvedUrl = url.toString();
  }

  return new PrismaClient({
    ...prismaConfig,
    datasources: {
      db: {
        url: resolvedUrl,
      },
    },
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
