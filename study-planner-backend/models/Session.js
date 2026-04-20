const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    schedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Schedule"
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    warnings: {
        type: Number,
        default: 0
    },
    isLocked: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Session", sessionSchema);