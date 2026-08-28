import pg from "pg";
const { Pool } = pg;
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDirectory, "../../../.env") });

const isLocalhost =
  process.env.DB_HOST === "localhost" || process.env.DB_HOST === "127.0.0.1";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: isLocalhost
    ? false
    : {
        rejectUnauthorized: false,
      },
});

export { pool };
