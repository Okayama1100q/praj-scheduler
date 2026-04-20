const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

console.log("AdminAuthRoutes loaded");

console.log("ENV USER:", process.env.ADMIN_USERNAME);
console.log("ENV PASS:", process.env.ADMIN_PASSWORD);

router.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (
        username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD
    ) {
        const token = jwt.sign(
            { role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.json({
            msg: "Admin login successful",
            token
        });
    }

    res.status(401).json({ msg: "Invalid credentials" });
});

module.exports = router;