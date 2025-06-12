const mongoose = require("mongoose");
const TestCourse = require("../models/CourseModel");
const Student = require("../models/StudentModel");

//const testCourseSchema = new mongoose.Schema({
 // courseId: { type: String, required: true, unique: true },
  //name: { type: String, required: true },
  //description: String,
  //createdBy: String,
//});

// ✅ Faculty creates course
exports.createCourse = async (req, res) => {
  try {
    const { courseId, name, description } = req.body;

    if (!courseId || !name || !description) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Check if course exists
    const exists = await TestCourse.findOne({ courseId });
    if (exists) {
      return res.status(409).json({ message: "🚫 Course already exists" });
    }

    const course = new TestCourse({
      courseId,
      name,
      description,
      createdBy: req.user.id,
    });

    await course.save();
    res.status(201).json({ message: "✅ Test Course Created", course });
  } catch (err) {
    console.error("❌ Create Test Course Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.addStudentToCourse = async (req, res) => {
  const { courseId, studentId } = req.body;
  try {
    const course = await TestCourse.findOne({ courseId });
    const student = await Student.findById(studentId);

    if (!course || !student) {
      return res.status(404).json({ message: "Invalid course or student" });
    }

    course.students = course.students || [];
    course.students.push(studentId);
    await course.save();

    student.courses = student.courses || [];
    student.courses.push(course._id);
    await student.save();

    res.json({ message: "Student added to course successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error adding student", error: err.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await TestCourse.find().select("courseId name");
    res.status(200).json({ courses });
  } catch (err) {
    console.error("Fetch all courses error:", err.message);
    res.status(500).json({ message: "Failed to fetch all courses." });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { name, description } = req.body;

    const updated = await TestCourse.findByIdAndUpdate(
      courseId,
      { name, description },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Course not found" });

    res.status(200).json({ message: "Course updated", course: updated });
  } catch (err) {
    console.error("❌ Error updating course:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const deleted = await TestCourse.findByIdAndDelete(courseId);

    if (!deleted) return res.status(404).json({ message: "Course not found" });

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting course:", err);
    res.status(500).json({ message: "Server error" });
  }
};
