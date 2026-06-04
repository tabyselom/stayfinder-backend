const db = require("../config/db");


// ===============================
// CREATE BOOKING (WITH PRICING)
// ===============================
exports.createBooking = async (req, res) => {
    try {
        const user_id = req.user.id;

        const {
            property_id,
            check_in,
            check_out
        } = req.body;

        // -----------------------
        // Validate input
        // -----------------------
        if (!property_id || !check_in || !check_out) {
            return res.status(400).json({
                message: "property_id, check_in, check_out are required"
            });
        }

        const startDate = new Date(check_in);
        const endDate = new Date(check_out);

        if (isNaN(startDate) || isNaN(endDate)) {
            return res.status(400).json({
                message: "Invalid date format"
            });
        }

        if (startDate >= endDate) {
            return res.status(400).json({
                message: "Check-out must be after check-in"
            });
        }

        // -----------------------
        // Get property
        // -----------------------
        const [properties] = await db.query(
            "SELECT * FROM properties WHERE id = ?",
            [property_id]
        );

        if (properties.length === 0) {
            return res.status(404).json({
                message: "Property not found"
            });
        }

        const property = properties[0];

        // Prevent self-booking
        if (property.owner_id === user_id) {
            return res.status(400).json({
                message: "You cannot book your own property"
            });
        }

        // -----------------------
        // Check overlapping bookings
        // -----------------------
        const [conflicts] = await db.query(
            `
            SELECT *
            FROM bookings
            WHERE property_id = ?
            AND status IN ('pending', 'approved')
            AND (
                check_in <= ?
                AND check_out >= ?
            )
            `,
            [
                property_id,
                check_out,
                check_in
            ]
        );

        if (conflicts.length > 0) {
            return res.status(400).json({
                message: "Property already booked for these dates"
            });
        }

        // -----------------------
        // Calculate nights & price
        // -----------------------
        const diffTime = endDate - startDate;
        const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const total_price = nights * property.price;

        // -----------------------
        // Create booking
        // -----------------------
        const [result] = await db.query(
            `
            INSERT INTO bookings
            (user_id, property_id, check_in, check_out, status, total_price)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                user_id,
                property_id,
                check_in,
                check_out,
                "pending",
                total_price
            ]
        );

        res.status(201).json({
            message: "Booking created successfully",
            booking_id: result.insertId,
            nights,
            price_per_night: property.price,
            total_price,
            status: "pending"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// ===============================
// GET MY BOOKINGS (USER)
// ===============================
exports.getMyBookings = async (req, res) => {
    try {
        const user_id = req.user.id;

        const [bookings] = await db.query(
            `
            SELECT
                b.*,
                p.title,
                p.image_url,
                p.price
            FROM bookings b
            JOIN properties p ON b.property_id = p.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
            `,
            [user_id]
        );

        res.json(bookings);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// ===============================
// GET OWNER BOOKINGS
// ===============================
exports.getPropertyBookings = async (req, res) => {
    try {
        const owner_id = req.user.id;

        const [bookings] = await db.query(
            `
            SELECT
                b.*,
                p.title,
                u.full_name,
                u.email,
                u.phone_number
            FROM bookings b
            JOIN properties p ON b.property_id = p.id
            JOIN users u ON b.user_id = u.id
            WHERE p.owner_id = ?
            ORDER BY b.created_at DESC
            `,
            [owner_id]
        );

        res.json(bookings);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// ===============================
// APPROVE BOOKING (OWNER ONLY)
// ===============================
exports.approveBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const ownerId = req.user.id;

        const [bookings] = await db.query(
            `
            SELECT b.id, p.owner_id
            FROM bookings b
            JOIN properties p ON b.property_id = p.id
            WHERE b.id = ?
            `,
            [bookingId]
        );

        if (bookings.length === 0) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        if (bookings[0].owner_id !== ownerId) {
            return res.status(403).json({
                message: "You do not own this property"
            });
        }

        await db.query(
            `
            UPDATE bookings
            SET status = 'approved'
            WHERE id = ?
            `,
            [bookingId]
        );

        res.json({
            message: "Booking approved"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// ===============================
// CANCEL BOOKING (USER ONLY)
// ===============================
exports.cancelBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user.id;

        const [bookings] = await db.query(
            `
            SELECT *
            FROM bookings
            WHERE id = ?
            `,
            [bookingId]
        );

        if (bookings.length === 0) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        if (bookings[0].user_id !== userId) {
            return res.status(403).json({
                message: "You can only cancel your own booking"
            });
        }

        await db.query(
            `
            UPDATE bookings
            SET status = 'cancelled'
            WHERE id = ?
            `,
            [bookingId]
        );

        res.json({
            message: "Booking cancelled"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};