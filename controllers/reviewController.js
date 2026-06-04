const db = require("../config/db");

// ADD REVIEW
exports.addReview = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { property_id, rating, comment } = req.body;

        if (!property_id || !rating) {
            return res.status(400).json({
                message: "Property and rating are required"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        // Check if user has an approved booking
        const [bookings] = await db.query(
            `
            SELECT *
            FROM bookings
            WHERE user_id = ?
            AND property_id = ?
            AND status = 'approved'
            `,
            [user_id, property_id]
        );

        if (bookings.length === 0) {
            return res.status(403).json({
                message: "You can only review properties you have booked"
            });
        }

        const [result] = await db.query(
            `
            INSERT INTO reviews
            (user_id, property_id, rating, comment)
            VALUES (?, ?, ?, ?)
            `,
            [user_id, property_id, rating, comment]
        );

        res.status(201).json({
            message: "Review added successfully",
            review_id: result.insertId
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getPropertyReviews = async (req, res) => {
    try {
        const propertyId = req.params.id;

        const [reviews] = await db.query(
            `
            SELECT
                r.*,
                u.full_name
            FROM reviews r
            JOIN users u
                ON r.user_id = u.id
            WHERE r.property_id = ?
            ORDER BY r.created_at DESC
            `,
            [propertyId]
        );

        res.json(reviews);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};