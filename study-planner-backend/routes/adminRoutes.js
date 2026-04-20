const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/adminMiddleware"); // ✅ IMPORTANT

const User = require("../models/User");
const Session = require("../models/Session");
const Schedule = require("../models/Schedule");

// 🔍 DEBUG (TEMP)
console.log("adminAuth:", typeof adminAuth);


// =======================
// GET ALL USERS
// =======================
router.get("/users", adminAuth, async (req, res) => {
    try {
        const users = await User.find().select("-password");

        res.json({
            count: users.length,
            users
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// =======================
// GET ALL SESSIONS
// =======================
router.get("/sessions", adminAuth, async (req, res) => {
    try {
        const sessions = await Session.find()
            .populate("user", "name email")
            .populate("schedule", "subject day");

        res.json({
            count: sessions.length,
            sessions
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// =======================
// STATS
// =======================
router.get("/stats", adminAuth, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalSchedules = await Schedule.countDocuments();
        const totalSessions = await Session.countDocuments();
        const lockedSessions = await Session.countDocuments({ isLocked: true });

        res.json({
            totalUsers,
            totalSchedules,
            totalSessions,
            lockedSessions
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// =======================
// USER PERFORMANCE
// =======================
router.get("/user-performance", adminAuth, async (req, res) => {
    try {
        const data = await Session.aggregate([
            {
                $group: {
                    _id: "$user",
                    totalSessions: { $sum: 1 },
                    totalWarnings: { $sum: "$warnings" },
                    lockedCount: {
                        $sum: {
                            $cond: [{ $eq: ["$isLocked", true] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        res.json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// =======================
module.exports = router;