const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const Submission = require("../models/SubmissionModel");

exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId, password } = req.body;
    const file = req.file;
    console.log("📦 Received file:", file);
    console.log("📄 File path saved:", file.path.replace(/\\/g, "/"));
    if (!file) return res.status(400).json({ error: "No file uploaded" });
    if (!password) return res.status(400).json({ error: "Password is required" });

    const submission = new Submission({
      student: req.user.id,
      assignment: assignmentId,
      filePath: file.path.replace(/\\/g, "/"), // store original path
      password, // plain (will hash later in production)
    });

    await submission.save();

    res.status(201).json({
      message: "Assignment submitted successfully",
      submissionId: submission._id
    });
  } catch (err) {
    console.error("Submission Error:", err);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

exports.decryptSubmission = async (req, res) => {
  const { password } = req.body;
  const { submissionId } = req.params;

  try {
    const submission = await Submission.findById(submissionId).populate("student");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const encryptedFilePath = submission.encryptedFilePath;
    const decryptedFileName = `decrypted-${Date.now()}-${path.basename(encryptedFilePath)}`;
    const decryptedFilePath = path.join("uploads/submissions/", decryptedFileName);

    const algorithm = "aes-256-cbc";
    const key = crypto.createHash("sha256").update(password).digest();
    const iv = Buffer.alloc(16, 0); // using 16 zero bytes (must match encryption pattern)

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const input = fs.createReadStream(encryptedFilePath);
    const output = fs.createWriteStream(decryptedFilePath);

    input.pipe(decipher).pipe(output);

    output.on("finish", () => {
      res.download(decryptedFilePath, (err) => {
        if (err) {
          return res.status(500).json({ error: "Download failed" });
        }

        // Optional: delete decrypted file after sending
        fs.unlinkSync(decryptedFilePath);
      });
    });

  } catch (err) {
    res.status(500).json({ message: "Decryption error", error: err.message });
  }
};

exports.getSubmissionsByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate("student", "name username email")
      .sort({ submittedAt: -1 });

    res.status(200).json({ submissions });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
};

exports.accessEncryptedSubmission = async (req, res) => {
  const { password } = req.body;
  const submissionId = req.params.submissionId;

  try {
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (submission.password !== password) {
      return res.status(403).json({ message: "Invalid password" });
    }

    res.status(200).json({ filePath: submission.filePath });
  } catch (err) {
    console.error("❌ Access Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
