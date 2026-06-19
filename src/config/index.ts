import dotenv from "dotenv";

dotenv.config();

const env = process.env;

export const config = {
  port: Number(env.PORT || 4000),
  nodeEnv: env.NODE_ENV || "development",
  
  // Database
  databaseHost: env.DATABASE_HOST || "localhost",
  databasePort: Number(env.DATABASE_PORT || 5432),
  databaseUser: env.DATABASE_USER || "postgres",
  databasePassword: env.DATABASE_PASSWORD || "password",
  databaseName: env.DATABASE_NAME || "prescription_db",
  databaseUrl: env.DATABASE_URL || "",
  
  // JWT
  jwtSecret: env.JWT_SECRET || "change-me-with-strong-secret",
  jwtRefreshSecret: env.JWT_REFRESH_SECRET || "change-me-with-strong-refresh-secret",
  jwtExpiryHours: Number(env.SESSION_EXPIRY_HOURS || 24),
  refreshTokenExpiryDays: Number(env.REFRESH_TOKEN_EXPIRY_DAYS || 30),
  
  // Email
  smtpHost: env.SMTP_HOST || "smtp.gmail.com",
  smtpPort: Number(env.SMTP_PORT || 587),
  smtpUser: env.SMTP_USER || "",
  smtpPassword: env.SMTP_PASSWORD || "",
  smtpFrom: env.SMTP_FROM || "noreply@example.com",
  
  // Google OAuth
  googleClientId: env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: env.GOOGLE_CLIENT_SECRET || "",
  googleCallbackUrl: env.GOOGLE_CALLBACK_URL || "http://localhost:4000/api/auth/google/callback",
  
  // Token expiry
  verificationTokenExpiryMinutes: Number(env.VERIFICATION_TOKEN_EXPIRY_MINUTES || 24 * 60),
  passwordResetTokenExpiryMinutes: Number(env.PASSWORD_RESET_TOKEN_EXPIRY_MINUTES || 60),
  
  // Security
  maxLoginAttempts: Number(env.MAX_LOGIN_ATTEMPTS || 5),
  lockoutDurationMinutes: Number(env.LOCKOUT_DURATION_MINUTES || 15),
  rateLimitWindowMs: Number(env.RATE_LIMIT_WINDOW_MS || 900000),
  rateLimitMaxRequests: Number(env.RATE_LIMIT_MAX_REQUESTS || 100),
  
  // Redis
  defaultPageSize: Number(env.DEFAULT_PAGE_SIZE || 20),
  redisHost: env.REDIS_HOST || "localhost",
  redisPort: Number(env.REDIS_PORT || 6379),
  redisPassword: env.REDIS_PASSWORD || "",
  redisDb: Number(env.REDIS_DB || 0),
};

// Validate critical configuration
if (!config.databaseUrl && !config.databaseHost) {
  throw new Error("DATABASE_URL or DATABASE_HOST is required in environment variables");
}

if (!config.jwtSecret || config.jwtSecret === "change-me-with-strong-secret") {
  console.warn("⚠️  WARNING: JWT_SECRET should be a strong secret key in production!");
}

if (!config.jwtRefreshSecret || config.jwtRefreshSecret === "change-me-with-strong-refresh-secret") {
  console.warn("⚠️  WARNING: JWT_REFRESH_SECRET should be a strong secret key in production!");
}
