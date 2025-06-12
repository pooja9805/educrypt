const mongoose = require("mongoose");

const TestCourseSchema = new mongoose.Schema({
  courseId: { type: String, unique: true },
  name: String,
  description: String,
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }]
});

module.exports = mongoose.model("TestCourse", TestCourseSchema); // 👈 Register as "TestCourse"
