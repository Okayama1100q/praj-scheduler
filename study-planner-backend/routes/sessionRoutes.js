const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const Schedule = require("../models/Schedule");
const Session = require("../models/Session");


// =======================
// START SESSION
// =======================
router.get("/start/:id", auth, async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);

        if (!schedule) {
            return res.status(404).json({ msg: "Schedule not found" });
        }

        const session = new Session({
            user: req.user,
            schedule: schedule._id,
            startTime: new Date(),
            isActive: true
        });

        await session.save();

        let pdfUrl = null;

        if (schedule.pdf) {
            pdfUrl = `http://localhost:5000/${schedule.pdf}`;
        }

        res.json({
            msg: "Session started",
            sessionId: session._id,
            subject: schedule.subject,
            pdf: pdfUrl
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// =======================
// WARNING SYSTEM
// =======================
router.post("/warn/:sessionId", auth, async (req, res) => {
    try {
        const session = await Session.findById(req.params.sessionId);

        if (!session) {
            return res.status(404).json({ msg: "Session not found" });
        }

        // if already locked → no need to increment
        if (session.isLocked) {
            return res.json({
                warnings: session.warnings,
                locked: true
            });
        }

        session.warnings += 1;

        if (session.warnings >= 3) {
            session.isLocked = true;
            session.isActive = false;
        }

        await session.save();

        res.json({
            warnings: session.warnings,
            locked: session.isLocked
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// =======================
// GET SESSION STATUS
// =======================
router.get("/status/:sessionId", auth, async (req, res) => {
    try {
        const session = await Session.findById(req.params.sessionId);

        if (!session) {
            return res.status(404).json({ msg: "Session not found" });
        }

        res.json({
            warnings: session.warnings,
            isLocked: session.isLocked,
            isActive: session.isActive,
            startTime: session.startTime
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// =======================
// END SESSION
// =======================
router.post("/end/:sessionId", auth, async (req, res) => {
    try {
        const session = await Session.findById(req.params.sessionId);

        if (!session) {
            return res.status(404).json({ msg: "Session not found" });
        }

        session.isActive = false;

        await session.save();

        res.json({
            msg: "Session ended successfully"
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// =======================
// GET USER SESSIONS (HISTORY)
// =======================
router.get("/", auth, async (req, res) => {
    try {
        const sessions = await Session.find({ user: req.user })
            .populate("schedule", "subject day")
            .sort({ createdAt: -1 });

        res.json(sessions);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// =======================
module.exports = router;