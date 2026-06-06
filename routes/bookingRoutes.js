const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.post(
    "/",
    authMiddleware,
    bookingController.createBooking
);

router.get(
    "/my-bookings",
    authMiddleware,
    bookingController.getMyBookings
);

router.get(
    "/owner-bookings",
    authMiddleware,
    authorizeRoles("owner", "admin"),
    bookingController.getPropertyBookings
);

router.patch(
    "/:id/approve",
    authMiddleware,
    authorizeRoles("owner", "admin"),
    bookingController.approveBooking
);

router.patch(
    "/:id/cancel",
    authMiddleware,
    bookingController.cancelBooking
);

router.patch(
    "/:id/reject",
    authMiddleware,
    bookingController.rejectBooking
);



module.exports = router;