const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ msg: "User with this email or username already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = new User({
            name,
            username,
            email,
            password: hashedPassword
        });

        await user.save();

        res.json({ msg: "User registered successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const cleanUsername = username.trim();
        const cleanPassword = password.trim();

        // 1. Check for Admin credentials first (from .env)
        const envAdminUser = (process.env.ADMIN_USERNAME || "").trim();
        const envAdminPass = (process.env.ADMIN_PASSWORD || "").trim();

        if (
            cleanUsername.toLowerCase() === envAdminUser.toLowerCase() &&
            cleanPassword === envAdminPass
        ) {
            const token = jwt.sign(
                { role: "admin" },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            return res.json({
                msg: "Admin login successful",
                token,
                role: "admin",
                user: { username: cleanUsername, name: "Administrator", role: "admin" }
            });
        }


        // 2. Regular User Login
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ msg: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: "user" },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ 
            token, 
            role: "user",
            user: { 
                id: user._id, 
                username: user.username, 
                name: user.name, 
                email: user.email,
                role: "user" 
            } 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Find user by ID from middleware
        const user = await User.findById(req.user);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid current password" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        res.json({ msg: "Password updated successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
