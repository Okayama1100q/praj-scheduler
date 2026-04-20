const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const scheduleController = require("../controllers/scheduleController");

const Schedule = require("../models/Schedule");
const Session = require("../models/Session");


// =======================
// CREATE schedule + PDF
// =======================
router.post(
    "/create",
    auth,
    upload.single("pdf"),
    scheduleController.createSchedule
);


// =======================
// GET all schedules
// =======================
router.get("/", auth, scheduleController.getSchedules);


// =======================
// RESCHEDULE (ONLY IF MISSED)
// =======================
router.put("/:id", auth, async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);

        if (!schedule) {
            return res.status(404).json({ msg: "Schedule not found" });
        }

        // 🔒 ownership check
        if (schedule.user.toString() !== req.user) {
            return res.status(403).json({ msg: "Unauthorized" });
        }

        // =======================
        // CHECK IF MISSED
        // =======================

        const now = new Date();

        // Convert schedule startTime (HH:mm) to today's Date
        const scheduleTime = new Date();
        const [hours, minutes] = schedule.startTime.split(":");

        scheduleTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // check if time passed
        const isTimePassed = now > scheduleTime;

        // check if session exists for this schedule
        const session = await Session.findOne({
            user: req.user,
            schedule: schedule._id
        });

        // ❌ NOT MISSED → BLOCK
        if (!isTimePassed || session) {
            return res.status(400).json({
                msg: "Reschedule allowed only for missed sessions"
            });
        }

        // =======================
        // UPDATE SCHEDULE
        // =======================

        const { day, startTime, endTime } = req.body;

        if (day) schedule.day = day;
        if (startTime) schedule.startTime = startTime;
        if (endTime) schedule.endTime = endTime;

        await schedule.save();

        res.json({
            msg: "Rescheduled successfully",
            schedule
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;