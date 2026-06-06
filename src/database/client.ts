import { Pool, QueryResultRow, Submittable } from "pg";
import { config } from "../config";
export const pool = new Pool({
  host: config.databaseHost,
  port: config.databasePort,
  user: config.databaseUser,
  password: config.databasePassword,
  database: config.databaseName,
});

pool.on("error", (error: unknown) => {
  console.error("Postgres unexpected error", error);
});
pool.on("connect", () => {
  console.log("✅ Postgres client connected");
});
pool.on("connect", () => {
  console.log("Client connected");
});

pool.on("acquire", () => {
  console.log("Client acquired");
});

pool.on("remove", () => {
  console.log("Client removed");
});

pool.on("error", (err) => {
  console.error("Pool error:", err);
});

export async function query<T extends any[] | QueryResultRow | Submittable = any>(text: string, params: any[] = []) {
  try {
    const result = await pool.query<T>(text, params);
    return result;
  } catch (error) {
    console.log(error);
    return {rows:[]};
  }
}
