const db = require("../config/db");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

// REGISTER
exports.register = async (req, res) => {
    try {
        const { full_name, phone_number, email, password } = req.body;

        const role = "customer";

        const [existingUser] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            `INSERT INTO users
            (full_name, phone_number, email, password, role)
            VALUES (?, ?, ?, ?, ?)`,
            [
                full_name,
                phone_number,
                email,
                hashedPassword,
                role
            ]
        );

        const user = {
            id: result.insertId,
            role
        };

        res.status(201).json({
            message: "User registered successfully",
            token: generateToken(user)
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.json({
            message: "Login successful",
            token: generateToken(user)
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.becomeOwner = async (req, res) => {
    try {
        await db.query(
            "UPDATE users SET role = 'owner' WHERE id = ?",
            [req.user.id]
        );

        res.json({
            message: "You are now an owner"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};