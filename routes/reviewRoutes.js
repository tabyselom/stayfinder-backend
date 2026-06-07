const express = require("express");
const router = express.Router();

const authMiddleware =
        require("../middleware/authMiddleware");

const reviewController =
        require("../controllers/reviewController");

router.post(
    "/",
    authMiddleware,
    reviewController.addReview
);

router.get(
    "/property/:propertyId",
    reviewController.getPropertyReviews
);

router.get(
    "/property/:propertyId/rating",
    reviewController.getPropertyRating
);

module.exports = router;