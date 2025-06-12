const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const Student = require("../models/StudentModel");
const Faculty = require("../models/FacultyModel");
const Admin = require("../models/AdminModel");

let otpStore = {}; // In-memory OTP storage

// 🔐 LOGIN
router.post("/login", async (req, res) => {
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
      return res.status(400).json({ error: "Invalid role" });
    }

    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: role }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.status(200).json({ token, name: user.name, role });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// 🔐 FORGOT PASSWORD – Send OTP from alternate Gmail account
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user =
    (await Student.findOne({ email })) ||
    (await Faculty.findOne({ email })) ||
    (await Admin.findOne({ email }));

  if (!user) return res.status(404).json({ message: "Email not registered." });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = otp;

  // ✅ Send OTP from alternate Gmail ID
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.OTP_EMAIL_USER, // ← this is your secondary Gmail ID
      pass: process.env.OTP_EMAIL_PASS  // ← its App Password
    }
  });

  const mailOptions = {
    from: `EduCrypt OTP <${process.env.OTP_EMAIL_USER}>`,
    to: email,
    subject: "🔐 EduCrypt - Your OTP Code",
    text: `
Hi ${user.name},

We received a request to reset your EduCrypt password.

Your OTP is: ${otp}

If this wasn't you, ignore this message.

– EduCrypt Support Team
`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ OTP sent to:", email, "→", otp);
    return res.status(200).json({ message: "OTP sent to your email address." });
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    return res.status(500).json({ message: "Failed to send OTP email.", error: error.message });
  }
});

// 🔐 RESET PASSWORD – Validate OTP and change password
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (otpStore[email] !== otp) {
    return res.status(401).json({ message: "Invalid or expired OTP." });
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  const userUpdated =
    (await Student.findOneAndUpdate({ email }, { password: hashed })) ||
    (await Faculty.findOneAndUpdate({ email }, { password: hashed })) ||
    (await Admin.findOneAndUpdate({ email }, { password: hashed }));

  if (!userUpdated) {
    return res.status(404).json({ message: "User not found." });
  }

  delete otpStore[email];

  return res.status(200).json({ message: "Password reset successful!" });
});

module.exports = router;
