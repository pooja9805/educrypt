const Assignment = require("../models/AssignmentModel");
const multer = require("multer");
const path = require("path");
const Material = require("../models/MaterialModel");
const Announcement = require("../models/AnnouncementModel");

// Store files in /uploads/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage });

exports.upload = upload.single("file"); // Middleware


exports.createAssignment = async (req, res) => {
  try {
    const { title, description, courseId, dueDate } = req.body;

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const assignment = new Assignment({
      course: courseId,
      title,
      description,
      filePath: req.file.path,
      uploadedBy: req.user.id,
      dueDate,
    });

    await assignment.save();

    res.status(201).json({ message: "Assignment uploaded successfully", assignment });
  } catch (err) {
    console.error("Assignment Upload Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.fetchAssignments = async (req, res) => {
  try {
    const id = req.params.courseId;
    const isObjectId = /^[a-f\d]{24}$/i.test(id);

    const filter = isObjectId
      ? { course: id } // faculty view → ObjectId
      : { courseId: id }; // student view → courseId string

    const assignments = await Assignment.find(filter).sort({ createdAt: -1 });

    res.status(200).json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ message: "Failed to fetch assignments" });
  }
};

// Upload Material
exports.uploadMaterial = async (req, res) => {
  try {
    const { title, description, courseId } = req.body;

    const material = new Material({
      course: courseId,
      title,
      description,
      filePath: req.file.path,
      uploadedBy: req.user.id,
    });

    await material.save();
    res.status(201).json({ message: "Material uploaded successfully", material });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Materials
exports.getMaterialsByCourse = async (req, res) => {
  try {
    const id = req.params.courseId;

    const isObjectId = /^[a-f\d]{24}$/i.test(id);
    const filter = isObjectId ? { course: id } : { courseId: id };

    const materials = await Material.find(filter).sort({ createdAt: -1 });

    res.status(200).json(materials);
  } catch (error) {
    console.error("Error fetching materials:", error);
    res.status(500).json({ message: "Failed to fetch materials" });
  }
};


// Post Announcement
exports.postAnnouncement = async (req, res) => {
  try {
    const { title, message, courseId } = req.body;

    const announcement = new Announcement({
      course: courseId,
      title,
      message,
      postedBy: req.user.id,
    });

    await announcement.save();
    res.status(201).json({ message: "Announcement posted", announcement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Announcements
exports.getAnnouncementsByCourse = async (req, res) => {
  try {
    const id = req.params.courseId;

    const isObjectId = /^[a-f\d]{24}$/i.test(id);
    const filter = isObjectId ? { course: id } : { courseId: id };

    const announcements = await Announcement.find(filter).sort({ createdAt: -1 });

    res.status(200).json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
};

  
