import { Pool, QueryResultRow, Submittable } from "pg";
import { config } from "../config";

export const pool = new Pool({
  host: config.databaseHost,
  port: config.databasePort,
  user: config.databaseUser,
  password: config.databasePassword,
  database: config.databaseName
});

pool.on("error", (error: unknown) => {
  console.error("Postgres unexpected error", error);
});

export async function query<T extends any[] | QueryResultRow | Submittable = any>(text: string, params: any[] = []) {
  const result = await pool.query<T>(text, params);
  return result;
}
