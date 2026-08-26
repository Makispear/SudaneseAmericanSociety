import express from "express";
import * as authController from "../controllers/authController.js";
import { loginRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// POST ROUTES
router.post("/login", loginRateLimiter, authController.login);
// GET ROUTES
// DELETE ROUTES
// PUT ROUTES

export default router;
