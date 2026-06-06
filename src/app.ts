import express from "express";
import cors from "cors";
// import "express-async-errors";
import routes from "./routes";
import { errorHandler } from "./middlewares/error.middleware";
import { config } from "./config";
import { createTables } from "./database/createTable";
import { connectRedis } from "./database/redis";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(errorHandler);

// Initialize Redis connection
connectRedis().catch((error) => {
  console.warn("Redis connection failed", error);
});

// createTables().catch((error) => {
//   console.error("Database initialization failed", error);
//   process.exit(1);
// });

const port = config.port;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
