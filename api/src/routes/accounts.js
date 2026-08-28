import express from "express";
import * as accountsController from "../controllers/accountsController.js";

const router = express.Router();

// POST ROUTES
router.post("/createAccount", accountsController.createAccount);
router.post("/verifyEmail", accountsController.verifyEmail);
router.post("/sendVerificationEmail", accountsController.sendVerificationEmail);
// GET ROUTES
// DELETE ROUTES
// router.delete("/deleteAccount", accountsController.deleteAccount);
// PUT ROUTES

export default router;
