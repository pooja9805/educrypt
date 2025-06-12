const Attendance = require("../models/AttendanceModel");

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
