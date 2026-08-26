import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import accountRoutes from "./routes/accounts.js";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
});
// TODO: create more limits for APIs

const app = express();

// Because express-rate-limit needs Express to already understand that it's behind a proxy before the limiter processes requests.
app.set("trust proxy", 1);

// MIDDLEWARE
app.use(helmet());
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// BASIC HEALTH CHECK ROUTE
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Sudanese American Society API" });
});

// API ROUTES
app.use("/api/accounts", accountRoutes);

export default app;
