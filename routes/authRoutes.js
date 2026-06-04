const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// REGISTER
router.post("/register", authController.register);

// LOGIN
router.post("/login", authController.login);

// BECOME OWNER
router.patch(
    "/become-owner",
    authMiddleware,
    authController.becomeOwner
);

module.exports = router;