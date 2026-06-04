const db = require("../config/db");


// ===============================
// DASHBOARD OVERVIEW
// ===============================
exports.getDashboardStats = async (req, res) => {
    try {
        // Total users
        const [users] = await db.query(
            "SELECT COUNT(*) AS total_users FROM users"
        );

        // Total properties
        const [properties] = await db.query(
            "SELECT COUNT(*) AS total_properties FROM properties"
        );

        // Total bookings
        const [bookings] = await db.query(
            "SELECT COUNT(*) AS total_bookings FROM bookings"
        );

        // Revenue (only approved bookings)
        const [revenue] = await db.query(
            `
            SELECT COALESCE(SUM(total_price), 0) AS total_revenue
            FROM bookings
            WHERE status = 'approved'
            `
        );

        // Active bookings
        const [active] = await db.query(
            `
            SELECT COUNT(*) AS active_bookings
            FROM bookings
            WHERE status = 'approved'
            `
        );

        // Pending bookings
        const [pending] = await db.query(
            `
            SELECT COUNT(*) AS pending_bookings
            FROM bookings
            WHERE status = 'pending'
            `
        );

        res.json({
            total_users: users[0].total_users,
            total_properties: properties[0].total_properties,
            total_bookings: bookings[0].total_bookings,
            total_revenue: revenue[0].total_revenue,
            active_bookings: active[0].active_bookings,
            pending_bookings: pending[0].pending_bookings
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getTopProperties = async (req, res) => {
    try {
        const [top] = await db.query(
            `
            SELECT 
                p.id,
                p.title,
                p.price,
                COUNT(b.id) AS total_bookings
            FROM properties p
            LEFT JOIN bookings b 
                ON p.id = b.property_id
            WHERE b.status = 'approved'
            GROUP BY p.id
            ORDER BY total_bookings DESC
            LIMIT 5
            `
        );

        res.json(top);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getRecentUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            `
            SELECT id, full_name, email, role, created_at
            FROM users
            ORDER BY created_at DESC
            LIMIT 10
            `
        );

        res.json(users);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            "SELECT id, full_name, email, role, created_at FROM users ORDER BY id DESC"
        );

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query("DELETE FROM users WHERE id = ?", [id]);

        res.json({ message: "User deleted" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProperties = async (req, res) => {
    try {
        const [data] = await db.query(
            "SELECT * FROM properties ORDER BY id DESC"
        );

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query("DELETE FROM properties WHERE id = ?", [id]);

        res.json({ message: "Property deleted" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getBookings = async (req, res) => {
    try {
        const [data] = await db.query(
            `
            SELECT b.*, u.full_name, p.title
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN properties p ON b.property_id = p.id
            ORDER BY b.id DESC
            `
        );

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};