import express from "express";
import testConnection, { pool } from "./config/db.js";
import accountRoutes from "./routes/accounts.js";

const app = express();

//  DATABASE CONNECTION
testConnection();

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// BASIC HEALTH CHECK ROUTE
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Sudanese American Society API" });
});

// API ROUTES
app.use("/api/accounts", accountRoutes);

export default app;
