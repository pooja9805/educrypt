const express = require("express");
const router = express.Router();
const multer = require("multer");

const { createAssignment, fetchAssignments,  uploadMaterial,
  getMaterialsByCourse,
  postAnnouncement,
  getAnnouncementsByCourse } = require("../controllers/assignmentController");
const { protect } = require("../middleware/authMiddleware");
const { roleCheck } = require("../middleware/roleMiddleware");

// Multer Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/assignments/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// POST /api/assignments/upload
router.post(
  "/upload",
  protect,
  roleCheck("faculty"),
  upload.single("file"),
  createAssignment
);

// GET /api/assignments/course/:courseId
router.get("/course/:courseId", protect, roleCheck("faculty"), fetchAssignments);

const materialStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/materials/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const uploadMaterialFile = multer({ storage: materialStorage });

router.post(
  "/materials/upload",
  protect,
  roleCheck("faculty"),
  uploadMaterialFile.single("file"),
  uploadMaterial
);

router.get("/materials/course/:courseId", protect, getMaterialsByCourse);

// ✅ Add Announcement Routes
router.post("/announcements", protect, roleCheck("faculty"), postAnnouncement);
router.get("/announcements/course/:courseId", protect, getAnnouncementsByCourse);
module.exports = router;
