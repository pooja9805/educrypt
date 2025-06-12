const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema({
  name: String,
  username: { type: String, required: true, unique: true },
  email: String,
  password: String,
  coursesCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  otp: String,
  otpExpires: Date
});

module.exports = mongoose.model("Faculty", facultySchema);
