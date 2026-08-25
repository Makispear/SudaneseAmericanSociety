import express from "express";
import * as accountsController from "../controllers/accountsController.js";

const router = express.Router();

router.get("/getAllUsers", accountsController.getAllUsers);
router.get("/verifyEmail", accountsController.verifyEmail);
router.post("/createAccount", accountsController.createAccount);
router.post("/sendVerificationEmail", accountsController.sendVerificationEmail);
router.delete("/deleteAccount", accountsController.deleteAccount);

export default router;
