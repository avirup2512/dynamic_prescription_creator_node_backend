import "dotenv/config";
import app from "./src/app";
import { config } from "./src/config";

const port = config.port;

const server = app.listen(port, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                  Server Started Successfully                   ║
╠════════════════════════════════════════════════════════════════╣
║ Port: ${port}
║ Environment: ${config.nodeEnv}
║ Database: ${config.databaseName}
║ API URL: http://localhost:${port}/api
╚════════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
