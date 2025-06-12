const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password:{ type: String, required: true, unique: true },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "TestCourse" }],
  otp: String,
  otpExpires: Date,
  photoUrl: { type: String },  // to store uploaded image URL or path
});

module.exports = mongoose.model("Student", studentSchema);
