const User = require("../models/UserModel");
const Student = require("../models/StudentModel");
const Faculty = require("../models/FacultyModel");
const Admin = require("../models/AdminModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.login = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    let user;

    if (role === "student") {
      user = await Student.findOne({ username });
    } else if (role === "faculty") {
      user = await Faculty.findOne({ username });
    } else if (role === "admin") {
      user = await Admin.findOne({ username });
    } else {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, 
      process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    console.log("✅ Logging in student with ID:", user._id);

    res.status(200).json({ token, user: {
      id: user._id,
      name: user.name,
      role: role, // ✅ Make sure role is included inside the user object
    } });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};

exports.requestReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Faculty.findOne({ email }); // Replace with role-specific logic if needed
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000;

    user.otp = otp;
    user.otpExpires = expires;
    await user.save();

    // Send OTP (simulate via console)
    console.log(`📧 OTP for ${email}: ${otp}`);

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await Faculty.findOne({ email }); // Adjust role if needed
    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: "Reset error", error: err.message });
  }
};