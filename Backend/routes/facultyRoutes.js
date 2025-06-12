const express = require("express");
const router = express.Router();
const { registerFaculty, loginFaculty, addStudent, createCourse, getMyCourses, getDashboard, getStudentsInCourse, updateCourse, deleteCourse } = require("../controllers/facultyController");
const { getAllCourses} = require("../controllers/courseController");
const { protect } = require("../middleware/authMiddleware");
const { roleCheck } = require("../middleware/roleMiddleware");
const TestCourse = require("../models/CourseModel");
const Faculty = require("../models/FacultyModel");

// ✅ Register/Login
router.post("/register", registerFaculty);
router.post("/login", loginFaculty);

// ✅ Faculty creates a new course (TestCourse)
router.post("/create-course", protect, roleCheck("faculty"), createCourse);

// ✅ Faculty views all courses created by them
router.get("/my-courses", protect, roleCheck("faculty"), getMyCourses);

// ✅ Optional: View all courses created by faculty
router.get("/all-courses", protect, roleCheck("faculty"), getAllCourses);

// ✅ Add NEW student and assign to course
router.post("/add-student", protect, roleCheck("faculty"), addStudent);

// ❌ Temporarily comment out this if unused
// router.post("/add-student-to-course", protect, roleCheck("faculty"), addStudentToCourse);

// ✅ get courses of the specific courses faculty have created in their dashboard
router.get("/dashboard", protect, roleCheck("faculty"), getDashboard);

// GET students of a particular course
router.get('/course/:courseId/students', protect, roleCheck("faculty"), getStudentsInCourse);

module.exports = router;
