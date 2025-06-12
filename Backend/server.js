require("dotenv").config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');


const app = express();
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const adminRoutes = require('./routes/adminRoutes');
// const attendanceRoutes = require('./routes/attendanceRoutes');
const notesRoutes = require('./routes/notesRoutes');
const compilerRoutes = require("./routes/compilerRoutes");
const chatRoutes = require("./routes/chatRoutes");
const courseRoutes = require("./routes/courseRoutes");

// app.use("/api/chat", chatRoutes);
const assignmentRoutes = require("./routes/assignmentRoutes");
const mongoose = require("mongoose");
const multer = require("multer");
const jwt = require("jsonwebtoken");

// 🔐 Temporary Protect Middleware
const tempProtect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecreteducrypt");
      req.user = decoded;
      next();
    } catch (err) {
      console.error("❌ JWT Error:", err.message);
      return res.status(401).json({ message: "Token failed" });
    }
  } else {
    return res.status(401).json({ message: "No token provided" });
  }
};


// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/admin", adminRoutes);
//app.use("/api/attendance", attendanceRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/course", facultyRoutes);
app.use("/api/assignments", require("./routes/assignmentRoutes"));
app.use("/api/submissions", require("./routes/submissionRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/compiler", require("./routes/compilerRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/materials", express.static(path.join(__dirname, "uploads/materials")));
app.use("/submissions", express.static(path.join(__dirname, "uploads/submissions")));
app.use("/uploads/profile", express.static(path.join(__dirname, "uploads/profile")));

// Default route
app.get('/', (req, res) => {
  res.send('EduCrypt Backend API Running');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {  
  console.log(`✅ Server running on http://localhost:${PORT}`);

});
