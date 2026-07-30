const express = require("express");
const router = express.Router();
const accountsController = require("../controllers/accountsController");

router.get("/getAllUsers", accountsController.getAllUsers);
router.post("/createAccount", accountsController.createAccount);

module.exports = router;
