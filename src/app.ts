import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
// import "express-async-errors";
import routes from "./routes";
import { errorHandler } from "./middlewares/error.middleware";
import { apiLimiter } from "./middlewares/rateLimiter.middleware";
import { config } from "./config";
import { createTables } from "./database/createTable";
import { connectRedis } from "./database/redis";
import authRoutes from "./modules/auth/auth.routes";
import rbacRoutes from "./modules/rbac/rbac.routes";
import sessionRoutes from "./modules/session/session.routes";
// import { rbacService } from "./modules/rbac/rbac.service";

const app = express();

// ============= Security Middleware =============
app.use(helmet()); // Set security HTTP headers

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
); // CORS configuration

// app.use(apiLimiter); // Rate limiting

// ============= Body Parsing Middleware =============
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ============= Request ID Middleware =============
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers["x-request-id"] || `req-${Date.now()}`;
  res.setHeader("X-Request-ID", requestId);
  next();
});

// ============= Health Check =============
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// ============= Legacy Routes =============
app.use("/api", routes);

// ============= Error Handler =============
app.use(errorHandler);

// ============= 404 Handler =============
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ============= Initialization =============

// Initialize Redis connection
connectRedis().catch((error) => {
  console.warn("Redis connection failed", error);
});

// Initialize database
// createTables().catch((error) => {
//   console.warn("Database initialization skipped", error);
// });

// Initialize RBAC
// rbacService.initializeDefaultRoles().catch((error) => {
//   console.error("RBAC initialization failed", error);
// });

// Export app
export default app;
