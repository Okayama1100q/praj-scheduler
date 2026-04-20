const Schedule = require("../models/Schedule");

// =======================
// CREATE SCHEDULE
// =======================
exports.createSchedule = async (req, res) => {
    try {
        const { subject, day, startTime, endTime } = req.body;

        const schedule = new Schedule({
            user: req.user,
            subject,
            day,
            startTime,
            endTime,
            pdf: req.file ? req.file.path.replace(/\\/g, "/") : null
        });

        await schedule.save();

        res.json({
            msg: "Schedule created successfully",
            schedule
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// =======================
// GET ALL SCHEDULES
// =======================
exports.getSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.find({ user: req.user });

        res.json(schedules);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};