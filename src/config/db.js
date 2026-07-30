import pg from "pg";
const { Pool } = pg;
import dotenv from "dotenv";
dotenv.config()

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

export { pool };

export default async function testConnection() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Successfully connected! Server time:", res.rows[0].now);
    return true;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return false;
  }
}
