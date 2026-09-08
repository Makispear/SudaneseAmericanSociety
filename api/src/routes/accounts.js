import express from "express";
import * as accountsController from "../controllers/accountsController.js";

const router = express.Router();

// POST ROUTES
router.post("/createAccount", accountsController.createAccount);
router.post("/sendVerificationEmail", accountsController.sendVerificationEmail);
// GET ROUTES
router.get("/verifyEmail", accountsController.verifyEmail);
// DELETE ROUTES
// router.delete("/deleteAccount", accountsController.deleteAccount);
// PUT ROUTES

export default router;
