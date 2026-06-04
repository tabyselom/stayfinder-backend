const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Dashboard stats
router.get(
    "/stats",
    authMiddleware,
    authorizeRoles("admin"),
    adminController.getDashboardStats
);

// Top properties
router.get(
    "/top-properties",
    authMiddleware,
    authorizeRoles("admin"),
    adminController.getTopProperties
);

// Recent users
router.get(
    "/recent-users",
    authMiddleware,
    authorizeRoles("admin"),
    adminController.getRecentUsers
);

router.get("/users", authMiddleware, authorizeRoles("admin"), adminController.getUsers);
router.delete("/users/:id", authMiddleware, authorizeRoles("admin"), adminController.deleteUser);

router.get("/properties", authMiddleware, authorizeRoles("admin"), adminController.getProperties);
router.delete("/properties/:id", authMiddleware, authorizeRoles("admin"), adminController.deleteProperty);

router.get("/bookings", authMiddleware, authorizeRoles("admin"), adminController.getBookings);

module.exports = router;