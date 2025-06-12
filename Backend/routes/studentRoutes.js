const express = require("express");
const router = express.Router();
const multer = require("multer");
const { getStudentDashboard } = require("../controllers/studentController");
const { protect } = require("../middleware/authMiddleware");
const { roleCheck } = require("../middleware/roleMiddleware");
const Student = require("../models/StudentModel");
const { getAllStudents} = require("../controllers/studentController");
const { getStudentAssignments } = require("../controllers/studentController");
const { getStudentNotifications } = require("../controllers/studentController");
const { getAttendanceSummary} = require("../controllers/studentController");
const { getMyAttendance } = require("../controllers/studentController"); // ✅ Import it from studentController

const {
  getAnnouncementsByCourse,
  getMaterialsByCourse,
  fetchAssignments
} = require("../controllers/assignmentController");
const { updateStudentProfile } = require("../controllers/studentController"); // ✅ ADD THIS


// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/profile"),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `profile-${Date.now()}.${ext}`);
  },
});
const upload = multer({ storage });

router.put("/update-profile", protect, upload.single("photo"), updateStudentProfile);

// GET all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get(
  "/assignments",
  protect,
  roleCheck("student"),
  getStudentAssignments
);

router.get(
  "/notifications",
  protect,
  roleCheck("student"),
  getStudentNotifications
);

router.get("/dashboard", protect, roleCheck("student"), getStudentDashboard);
router.get("/attendance-summary", protect, roleCheck("student"), getAttendanceSummary);
// 📢 Fetch announcements for a course
router.get("/announcements/:courseId", protect, roleCheck("student"), getAnnouncementsByCourse);

// 📁 Fetch materials for a course
router.get("/materials/:courseId", protect, roleCheck("student"), getMaterialsByCourse);

// 📝 Fetch assignments for a course
router.get("/assignments/:courseId", protect, roleCheck("student"), fetchAssignments);
router.get("/my-attendance", protect, roleCheck("student"), getMyAttendance);

module.exports = router;
