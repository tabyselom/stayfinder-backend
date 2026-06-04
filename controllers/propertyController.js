const db = require("../config/db");
const cloudinary = require("../config/cloudinary");
const getLocationFromCoordinates = require("../utils/geocode");


// CREATE PROPERTY
exports.createProperty = async (req, res) => {
    try {
        const owner_id = req.user.id;

        const {
            title,
            description,
            price,
            house_size,
            bedrooms,
            kitchens,
            bathrooms,
            has_parking,
            latitude,
            longitude,
            display_location
        } = req.body;

        let image_url = null;

        // ---------------------------
        // IMAGE UPLOAD (Cloudinary)
        // ---------------------------
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: "qirbnb" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(req.file.buffer);
            });

            image_url = result.secure_url;
        }

        // ---------------------------
        // REVERSE GEOCODING
        // ---------------------------
        let final_location = display_location;

        if (!final_location && latitude && longitude) {
            final_location = await getLocationFromCoordinates(
                latitude,
                longitude
            );
        }

        // ---------------------------
        // INSERT PROPERTY
        // ---------------------------
        const [result] = await db.query(
            `INSERT INTO properties 
            (owner_id, title, description, price, house_size, bedrooms, kitchens, bathrooms, has_parking, latitude, longitude, display_location, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                owner_id,
                title,
                description,
                price,
                house_size,
                bedrooms,
                kitchens,
                bathrooms,
                has_parking,
                latitude,
                longitude,
                final_location,
                image_url
            ]
        );

        res.status(201).json({
            message: "Property created successfully",
            property_id: result.insertId,
            image_url,
            display_location: final_location
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// GET ALL PROPERTIES (with filters + pagination)
exports.getProperties = async (req, res) => {
    try {
        const {
            minPrice,
            maxPrice,
            bedrooms,
            parking,
            location,
            page = 1,
            limit = 10
        } = req.query;

        let sql = `
            SELECT *
            FROM properties
            WHERE 1=1
        `;

        const params = [];

        if (minPrice) {
            sql += " AND price >= ?";
            params.push(minPrice);
        }

        if (maxPrice) {
            sql += " AND price <= ?";
            params.push(maxPrice);
        }

        if (bedrooms) {
            sql += " AND bedrooms >= ?";
            params.push(bedrooms);
        }

        if (parking === "true") {
            sql += " AND has_parking = 1";
        }

        if (location) {
            sql += " AND display_location LIKE ?";
            params.push(`%${location}%`);
        }

        const offset = (page - 1) * limit;

        sql += `
            ORDER BY created_at DESC
            LIMIT ?
            OFFSET ?
        `;

        params.push(Number(limit));
        params.push(Number(offset));

        const [properties] = await db.query(sql, params);

        res.json(properties);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// GET PROPERTY BY ID
exports.getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;

        const [property] = await db.query(
            `
            SELECT *
            FROM properties
            WHERE id = ?
            `,
            [id]
        );

        if (property.length === 0) {
            return res.status(404).json({
                message: "Property not found"
            });
        }

        res.json(property[0]);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// GET PROPERTY AVAILABILITY (booked dates)
exports.getPropertyAvailability = async (req, res) => {
    try {
        const { id } = req.params;

        const [bookings] = await db.query(
            `
            SELECT check_in, check_out
            FROM bookings
            WHERE property_id = ?
            AND status IN ('pending', 'approved')
            `,
            [id]
        );

        res.json(bookings);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};