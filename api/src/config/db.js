import pg from "pg";
const { Pool } = pg;
import dotenv from "dotenv";
dotenv.config();

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
