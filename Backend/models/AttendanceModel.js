const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "TestCourse", required: true },
  date: { type: Date, default: Date.now },
  students: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      status: { type: String, enum: ["Present", "Absent"] },
    },
  ],
});

module.exports = mongoose.model("Attendance", attendanceSchema);
