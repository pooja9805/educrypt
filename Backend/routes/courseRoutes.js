const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { roleCheck } = require("../middleware/roleMiddleware");
const { updateCourse, deleteCourse } = require("../controllers/courseController");

// Only faculty can update/delete courses
router.put("/:courseId", protect, roleCheck("faculty"), updateCourse);
router.delete("/:courseId", protect, roleCheck("faculty"), deleteCourse);

module.exports = router;
