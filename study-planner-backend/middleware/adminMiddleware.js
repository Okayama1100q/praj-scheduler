const jwt = require("jsonwebtoken");

const adminAuth = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ msg: "No token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "admin") {
            return res.status(403).json({ msg: "Not admin" });
        }

        next();

    } catch (err) {
        res.status(401).json({ msg: "Invalid token" });
    }
};

module.exports = adminAuth;   // ✅ THIS LINE FIXES EVERYTHING