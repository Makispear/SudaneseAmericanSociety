import express from "express";
import helmet from "helmet";
import accountRoutes from "./routes/accounts.js";
import authRoutes from "./routes/auth.js";
import { generalRateLimiter } from "./middleware/rateLimiter.js";

const app = express();

// Because express-rate-limit needs Express to already understand that it's behind a proxy before the limiter processes requests.
app.set("trust proxy", 1);

// MIDDLEWARE
app.use(helmet());
app.use(generalRateLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// BASIC HEALTH CHECK ROUTE
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Sudanese American Society API" });
});

// API ROUTES
app.use("/api/accounts", accountRoutes);
app.use("/api/auth", authRoutes);

export default app;
