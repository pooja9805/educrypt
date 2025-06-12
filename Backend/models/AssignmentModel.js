const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  title: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  filePath: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" },
  uploadedAt: { type: Date, default: Date.now },
  dueDate: Date
});

module.exports = mongoose.model("Assignment", assignmentSchema);
