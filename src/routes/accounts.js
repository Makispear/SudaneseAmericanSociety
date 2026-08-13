const express = require("express");
const router = express.Router();
const accountsController = require("../controllers/accountsController");

router.get("/getAllUsers", accountsController.getAllUsers);
router.post("/createAccount", accountsController.createAccount);
router.delete("/deleteAccount", accountsController.deleteAccount);

module.exports = router;
