const db = require("../config/db");

exports.addReview = async (req, res) => {
    try {

        const user_id = req.user.id;

        const {
            property_id,
            rating,
            comment
        } = req.body;

        if (!property_id || !rating) {
            return res.status(400).json({
                message: "property_id and rating are required"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        // Verify completed booking
        const [bookings] = await db.query(
            `
            SELECT *
            FROM bookings
            WHERE user_id = ?
            AND property_id = ?
            AND status = 'approved'
            AND check_out < NOW()
            `,
            [user_id, property_id]
        );

        if (bookings.length === 0) {
            return res.status(403).json({
                message:
                    "You can only review properties you have stayed in"
            });
        }

        // Prevent duplicate reviews
        const [existing] = await db.query(
            `
            SELECT *
            FROM reviews
            WHERE user_id = ?
            AND property_id = ?
            `,
            [user_id, property_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                message:
                    "You have already reviewed this property"
            });
        }

        const [result] = await db.query(
            `
            INSERT INTO reviews
            (
                user_id,
                property_id,
                rating,
                comment
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                user_id,
                property_id,
                rating,
                comment
            ]
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

        const propertyId =
                req.params.propertyId;

        const [reviews] = await db.query(
            `
            SELECT
                r.id,
                r.rating,
                r.comment,
                r.created_at,
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

exports.getPropertyRating = async (req, res) => {

    try {

        const propertyId =
                req.params.propertyId;

        const [rows] = await db.query(
            `
            SELECT
                COUNT(*) AS total_reviews,
                ROUND(AVG(rating),1)
                    AS average_rating
            FROM reviews
            WHERE property_id = ?
            `,
            [propertyId]
        );

        res.json(rows[0]);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};