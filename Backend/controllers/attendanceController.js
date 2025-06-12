const Attendance = require("../models/AttendanceModel");
const Course = require("../models/CourseModel");

const markAttendance = async (req, res) => {
  const { courseId, records, date } = req.body;
  try {
    for (let record of records) {
      await Attendance.findOneAndUpdate(
        { course: courseId, student: record.studentId, date },
        { $set: { status: record.status } },
        { upsert: true, new: true }
      );
    }
    res.json({ message: "✅ Attendance marked successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error marking attendance", error: err.message });
  }
};

const getAttendanceSummary = async (req, res) => {
  try {
    const studentId = req.user.id;

    const records = await Attendance.find({ student: studentId })
      .populate("course", "courseId name description");

    const summary = records.map(record => {
      const totalSessions = records.filter(r => r.course._id.equals(record.course._id)).length;
      const attendedSessions = records.filter(
        r => r.course._id.equals(record.course._id) && r.status === "Present"
      ).length;

      const percentage = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0;

      return {
        courseId: record.course.courseId,
        courseName: record.course.name,
        description: record.course.description,
        attended: attendedSessions,
        total: totalSessions,
        percentage,
      };
    });

    // Deduplicate summary by courseId
    const uniqueSummary = summary.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.courseId === value.courseId)
    );

    res.status(200).json({ name: req.user.name, attendance: uniqueSummary });
  } catch (err) {
    console.error("❌ Attendance Summary Error:", err.message);
    res.status(500).json({ message: "Failed to get summary", error: err.message });
  }
};

const getCourseAttendanceHistory = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const records = await Attendance.find({ course: courseId }).populate("student", "name");
    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch course attendance", error: err.message });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    const { courseId, studentId, date } = req.body;
    if (!courseId || !studentId || !date) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const result = await Attendance.findOneAndDelete({
      course: courseId,
      student: studentId,
      date
    });

    if (!result) return res.status(404).json({ message: "Record not found" });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};

module.exports = {
  markAttendance,
  getAttendanceSummary,
  getCourseAttendanceHistory,
  deleteAttendance
};
