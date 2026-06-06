import dotenv from "dotenv";

dotenv.config();

const env = process.env;

export const config = {
  port: Number(env.PORT || 4000),
  databaseHost: env.DATABASE_HOST || "",
  databasePort: Number(env.DATABASE_PORT || 5432),
  databaseUser: env.DATABASE_USER || "",
  databasePassword: env.DATABASE_PASSWORD || "",
  databaseName: env.DATABASE_NAME || "",
  jwtSecret: env.JWT_SECRET || "changeme",
  nodeEnv: env.NODE_ENV || "development",
  defaultPageSize: Number(env.DEFAULT_PAGE_SIZE || 20),
};

if (!config.databaseHost) {
  throw new Error("DATABASE_HOST is required in environment variables");
}
