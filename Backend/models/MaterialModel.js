const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  title: String,
  description: String,
  filePath: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Material", materialSchema);
