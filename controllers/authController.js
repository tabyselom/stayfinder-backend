const db = require("../config/db");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

// ===============================
// REGISTER
// ===============================
exports.register = async (req, res) => {
    try {
        const {
            full_name,
            phone_number,
            email,
            password
        } = req.body;

        if (
            !full_name ||
            !phone_number ||
            !email ||
            !password
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const role = "customer";

        const [existingUser] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            `
            INSERT INTO users
            (
                full_name,
                phone_number,
                email,
                password,
                role
            )
            VALUES (?, ?, ?, ?, ?)
            `,
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
            full_name,
            phone_number,
            email,
            role
        };

        res.status(201).json({
            message: "User registered successfully",
            token: generateToken(user),
            user
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ===============================
// LOGIN
// ===============================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const [users] = await db.query(
            `
            SELECT
                id,
                full_name,
                phone_number,
                email,
                password,
                role
            FROM users
            WHERE email = ?
            `,
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const userData = {
            id: user.id,
            full_name: user.full_name,
            phone_number: user.phone_number,
            email: user.email,
            role: user.role
        };

        res.json({
            message: "Login successful",
            token: generateToken(userData),
            user: userData
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ===============================
// BECOME OWNER
// ===============================
exports.becomeOwner = async (req, res) => {
    try {

        const userId = req.user.id;

        const [users] = await db.query(
            "SELECT * FROM users WHERE id = ?",
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const user = users[0];

        if (user.role === "owner") {
            return res.status(400).json({
                message: "You are already an owner"
            });
        }

        await db.query(
            `
            UPDATE users
            SET role = 'owner'
            WHERE id = ?
            `,
            [userId]
        );

        const updatedUser = {
            id: user.id,
            full_name: user.full_name,
            phone_number: user.phone_number,
            email: user.email,
            role: "owner"
        };

        res.json({
            message: "You are now an owner",
            token: generateToken(updatedUser),
            user: updatedUser
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};