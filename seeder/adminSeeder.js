require("dotenv").config();
const db = require("../config/db");
const bcrypt = require("bcrypt");

const seedAdmin = async () => {
    try {
        const email = "admin@stayfinder.com";

        // check if admin exists
        const [existing] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (existing.length > 0) {
            console.log("Admin already exists");
            process.exit();
        }

        const hashedPassword = await bcrypt.hash("admin123", 10);

        await db.query(
            `INSERT INTO users (full_name, phone_number, email, password, role)
             VALUES (?, ?, ?, ?, ?)`,
            [
                "System Admin",
                "0000000000",
                email,
                hashedPassword,
                "admin"
            ]
        );

        console.log("Admin created successfully");
        process.exit();

    } catch (error) {
        console.log("Seeder error:", error.message);
        process.exit(1);
    }
};

seedAdmin();