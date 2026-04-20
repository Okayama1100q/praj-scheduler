const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  subject: {
    type: String,
    required: true
  },
  day: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  pdf: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model("Schedule", scheduleSchema);