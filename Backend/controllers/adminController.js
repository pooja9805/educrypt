const Admin = require("../models/AdminModel");
const bcrypt = require("bcrypt");

exports.registerAdmin = async (req, res) => {
  const { name, username, email, password } = req.body;
  try {
    const exists = await Admin.findOne({ username });
    if (exists) return res.status(400).json({ message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ name, username, email, password: hashedPassword });
    await newAdmin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error registering admin", error: err.message });
  }
};
