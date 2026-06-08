const express = require("express");
const router = express.Router();

const propertyController = require("../controllers/propertyController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.get("/", propertyController.getProperties);

router.get(
    "/my",
    authMiddleware,
    propertyController.getMyProperties
);

router.post(
    "/",
    authMiddleware,
    authorizeRoles("owner", "admin"),
    upload.single("image"),
    propertyController.createProperty
);

router.get("/:id", propertyController.getPropertyById);
router.put(
    "/:id",
    authMiddleware,
    propertyController.updateProperty
);

module.exports = router;