const express = require("express");
const router = express.Router();

const {
  markAttendance,
  getAttendanceSummary,
  getCourseAttendanceHistory,
  deleteAttendance
} = require("../controllers/attendanceController");

const { protect } = require("../middleware/authMiddleware");
const { roleCheck } = require("../middleware/roleMiddleware");


// ✅ Logs to ensure everything is functional
console.log("✅ Middleware Type Check:");
console.log("protect type:", typeof protect);
console.log("roleCheck type:", typeof roleCheck);
console.log("roleCheck('faculty') type:", typeof roleCheck("faculty"));

// ✅ Routes
router.post("/mark", protect, roleCheck("faculty"), markAttendance);
router.get("/summary", protect, roleCheck("student"), getAttendanceSummary);
router.get("/course/:courseId/history", protect, roleCheck("faculty"), getCourseAttendanceHistory);
router.delete("/delete", protect, roleCheck("faculty"), deleteAttendance);

module.exports = router;
