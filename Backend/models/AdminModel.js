const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
  email: String,
  password: String,
  otp: String,
  otpExpires: Date
});

module.exports = mongoose.model("Admin", adminSchema);
