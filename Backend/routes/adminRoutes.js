const express = require("express");
const router = express.Router();
const { registerAdmin } = require("../controllers/adminController");
const Admin = require("../models/AdminModel");
const bcrypt = require("bcrypt");

// POST /api/admin/register
router.post("/register", async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    const existing = await Admin.findOne({ username });
    if (existing) return res.status(400).json({ error: "Username already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const admin = new Admin({ name, username, email, password: hashed });

    await admin.save();
    res.status(201).json({ message: "Admin registered" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
