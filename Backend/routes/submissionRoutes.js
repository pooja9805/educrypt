const express = require("express");
const router = express.Router();
const multer = require("multer");

const { submitAssignment } = require("../controllers/submissionController");
const { protect } = require("../middleware/authMiddleware");
const { roleCheck } = require("../middleware/roleMiddleware");
const { decryptSubmission } = require("../controllers/submissionController");
const { getSubmissionsByAssignment, accessEncryptedSubmission  } = require("../controllers/submissionController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/submissions/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.post(
  "/submit",
  protect,
  roleCheck("student"),
  upload.single("file"),
  submitAssignment
);

// Decrypt and download
router.post(
    "/decrypt/:submissionId",
    protect,
    roleCheck("faculty"), // or admin if needed
    decryptSubmission
  );


router.get(
    "/assignment/:assignmentId",
    protect,
    getSubmissionsByAssignment
  );
  
// ✅ New route for accessing encrypted submission
router.post("/access/:submissionId", protect, accessEncryptedSubmission);

module.exports = router;
