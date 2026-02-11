const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// In production, store your JWT secret in an environment variable!
const JWT_SECRET = "your_jwt_secret_key_here";

// Function to validate strong password criteria
function isStrongPassword(password) {
    // At least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return strongPasswordRegex.test(password);
}

// Signup route
router.post("/signup", async (req, res) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    // Validate password strength
    if (!isStrongPassword(password)) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character."
        });
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists." });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user with the hashed password
        const user = new User({ email, password: hashedPassword });
        await user.save();

        res.status(201).json({ success: true, message: "User created successfully." });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ success: false, message: "Server error." });
    }
});

// Login route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        // Create a payload with user information (avoid including sensitive data)
        const payload = { userId: user._id, email: user.email };

        // Generate a JWT token (expires in 1 hour)
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ success: true, message: "Login successful!", token });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, message: "Server error." });
    }
});

module.exports = router;
