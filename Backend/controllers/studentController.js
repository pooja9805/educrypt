const Student = require("../models/StudentModel");
const Attendance = require("../models/AttendanceModel");
const TestCourse = require("../models/CourseModel");
const Assignment = require("../models/AssignmentModel");
const Submission = require("../models/SubmissionModel");
const { getUpcomingNotifications } = require("../utils/notificationHelper");

exports.updateStudentProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const studentId = req.user.id;

    const updates = { name, email };
    if (req.file) {
      updates.photoUrl = `uploads/profile/${req.file.filename}`;
    }

    const updated = await Student.findByIdAndUpdate(studentId, updates, { new: true });
    res.status(200).json({ message: "Profile updated", student: updated });
  } catch (err) {
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Error fetching students", error: err.message });
  }
};

exports.getStudentAssignments = async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1. Find all courses the student is enrolled in (future expansion)
    // 2. Find all assignments
    const allAssignments = await Assignment.find();

    // 3. Find all student submissions
    const submittedAssignments = await Submission.find({ student: studentId }).select("assignment");

    const submittedIds = submittedAssignments.map(sub => sub.assignment.toString());

    const submitted = allAssignments.filter(assign => submittedIds.includes(assign._id.toString()));
    const pending = allAssignments.filter(assign => !submittedIds.includes(assign._id.toString()));

    res.status(200).json({ submitted, pending });
  } catch (err) {
    console.error("Student assignment fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getStudentNotifications = async (req, res) => {
  try {
    const notifications = await getUpcomingNotifications(req.user.id);
    res.status(200).json({ notifications });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

exports.getStudentDashboard = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .populate({
        path: "courses",
        select: "_id name description courseId"
     });
  

    if (!student) return res.status(404).json({ message: "Student not found" });

    res.status(200).json({
        name: student.name,
        courses: student.courses.map(course => ({
        _id: course._id, // ✅ Include MongoDB _id
        name: course.name,
        description: course.description,
        courseId: course.courseId
      }))
    });
  } catch (err) {
    console.error("Dashboard Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAttendanceSummary = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get all attendance records for this student
    const records = await Attendance.find({ student: studentId }).populate({
      path: 'course',
      model: 'TestCourse'  // ✅ Correct model name now
    })
    const summary = records.map((entry) => ({
      course: entry.course.name,
      attended: entry.attendedSessions,
      total: entry.totalSessions,
    }));

    res.json({ attendance: summary });
  } catch (err) {
    console.error("Attendance Summary Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;

    const records = await Attendance.find({ student: studentId })
      .populate("course", "courseId name")
      .sort({ date: -1 });

    const result = records.map(r => ({
      courseId: r.course.courseId,
      courseName: r.course.name,
      date: r.date,
      status: r.status
    }));

    res.status(200).json({ success: true, attendance: result });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to load your attendance",
      error: err.message
    });
  }
};
