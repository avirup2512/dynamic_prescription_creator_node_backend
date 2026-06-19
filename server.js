"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./src/app"));
const config_1 = require("./src/config");
const port = config_1.config.port;
const server = app_1.default.listen(port, () => {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                  Server Started Successfully                   ║
╠════════════════════════════════════════════════════════════════╣
║ Port: ${port}
║ Environment: ${config_1.config.nodeEnv}
║ Database: ${config_1.config.databaseName}
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
