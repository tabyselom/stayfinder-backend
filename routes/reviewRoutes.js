const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
    "/",
    authMiddleware,
    reviewController.addReview
);

router.get(
    "/property/:id",
    reviewController.getPropertyReviews
);

module.exports = router;