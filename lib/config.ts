// Validate environment variables (only on server side)
const validateConfig = () => {
  // Only validate on server side (not in browser)
  if (typeof window !== "undefined") {
    return true; // Skip validation in browser
  }

  const isProduction = process.env.NODE_ENV === "production";
  const errors: string[] = [];

  if (isProduction) {
    if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
      errors.push("NEXT_PUBLIC_API_BASE_URL is required in production");
    }
    if (!process.env.NEXTAUTH_URL) {
      errors.push("NEXTAUTH_URL is required in production");
    }
    if (!process.env.NEXTAUTH_SECRET) {
      errors.push("NEXTAUTH_SECRET is required in production");
    }
  }

  if (errors.length > 0) {
    console.error("❌ Configuration errors:", errors);
    // In production, we still want the app to work, but log the errors
    if (isProduction) {
      console.warn("⚠️ App may not work correctly without these variables");
    }
  }

  return errors.length === 0;
};

// Validate on module load (only in production and on server side)
if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
  validateConfig();
}

const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001",
  nextAuthUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
  isProduction: process.env.NODE_ENV === "production",
  isValid: typeof window === "undefined" ? validateConfig() : true, // Only validate on server
};

export default config;
