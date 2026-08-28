import express from "express";
import * as authController from "../controllers/authController.js";
import { loginRateLimiter, PWRateLimiter } from "../middleware/rateLimiter.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// POST ROUTES
router.post("/login", loginRateLimiter, authController.login); // for logging in users
router.post("/forgotPassword", PWRateLimiter, authController.forgotPassword); // for sending password reset email
router.post("/refreshToken", authController.refreshToken); // for refreshing access token
router.post("/logout", authController.logout); // for logging out users
// PATCH ROUTES
router.patch("/changePassword", authenticate, authController.changePassword); // for changing password when logged in
router.patch("/resetPassword", PWRateLimiter, authController.resetPassword); // for changing password using reset token in email
// GET ROUTES
// DELETE ROUTES
// PUT ROUTES

export default router;
