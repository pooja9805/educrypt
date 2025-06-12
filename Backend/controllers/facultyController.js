const nodemailer = require("nodemailer");
const Faculty = require("../models/FacultyModel");
const Student = require("../models/StudentModel");
const TestCourse = require("../models/CourseModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ✅ Global Email Transporter using consistent credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,      // ✅ Set this in .env
    pass: process.env.EMAIL_PASS,      // ✅ Use Gmail App Password
  },
});

// ✅ Register Faculty
exports.registerFaculty = async (req, res) => {
  const { name, username, email, password } = req.body;
  try {
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const exists = await Faculty.findOne({ username });
    if (exists) return res.status(400).json({ message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newFaculty = new Faculty({ name, username, email, password: hashedPassword });
    await newFaculty.save();

    res.status(201).json({ message: "Faculty registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error registering faculty", error: err.message });
  }
};

// ✅ Login Faculty
exports.loginFaculty = async (req, res) => {
  const { username, password } = req.body;

  try {
    const faculty = await Faculty.findOne({ username });
    if (!faculty) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, faculty.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: faculty._id, role: "faculty" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: faculty._id,
        name: faculty.name,
        username: faculty.username,
        email: faculty.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
};

// ✅ Add Student and Assign to Course
exports.addStudent = async (req, res) => {
  try {
    const { name, username, email, courseIds } = req.body;

    if (!name || !username || !email || !courseIds || !Array.isArray(courseIds)) {
      return res.status(400).json({ message: "All fields are required and courseIds must be an array." });
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    const existing = await Student.findOne({
      $or: [{ username: trimmedUsername }, { email: trimmedEmail }]
    });

    if (existing) {
      return res.status(409).json({ message: "Student already exists." });
    }

    // Create password and hash
    const rawPassword = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const student = new Student({
      name,
      username: trimmedUsername,
      email: trimmedEmail,
      password: hashedPassword,
      courses: [] // will push courses below
    });

    // Validate and assign courses
    const courses = await TestCourse.find({ _id: { $in: courseIds } });

    if (courses.length === 0) {
      return res.status(404).json({ message: "No valid courses found." });
    }

    for (const course of courses) {
      course.students.push(student._id);
      await course.save();

      student.courses.push(course._id);
    }

    await student.save();

    // ✅ Debug: Check if environment variables are loading
    console.log("EMAIL USER:", process.env.EMAIL_USER);
    console.log("EMAIL PASS:", process.env.EMAIL_PASS ? "✅ Loaded" : "❌ Not Loaded");

    // ✅ Send Email using global transporter
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: student.email,
      subject: "EduCrypt Credentials",
      text: `Hello ${student.name},\n\nYour EduCrypt login credentials are:\nUsername: ${student.username}\nPassword: ${rawPassword}\n\nLogin here: http://localhost:5500/Frontend/html/student-login.html\n\nThanks,\nEduCrypt Team`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailErr) {
      console.error("❌ Email sending failed:", emailErr);
      return res.status(500).json({ message: "Student added but email sending failed", error: emailErr.toString() });
    }

    res.status(201).json({
      message: "✅ Student registered and enrolled in selected courses.",
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        username: student.username,
        password: rawPassword,
        enrolledCourses: courses.map(c => c.name),
      },
    });

  } catch (err) {
    console.error("❌ Error in addStudent:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Faculty creates course
exports.createCourse = async (req, res) => {
  try {
    const { courseId, name, description } = req.body;
    const facultyId = req.user._id;

    if (!courseId || !name || !description) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existing = await TestCourse.findOne({ courseId });
    if (existing) {
      return res.status(409).json({ message: "Course ID already exists." });
    }

    const newCourse = new TestCourse({
      courseId,
      name,
      description,
      faculty: facultyId
    });

    await newCourse.save();
    res.status(201).json({ message: "✅ Course created successfully", course: newCourse });
  } catch (err) {
    console.error("❌ Error in createCourse:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get courses created by this faculty
exports.getMyCourses = async (req, res) => {
  try {
    const facultyId = req.user._id;
    console.log("REQ.USER", req.user);
    const courses = await TestCourse.find({ faculty: facultyId }).select("courseId name");
    res.status(200).json(courses);
  } catch (error) {
    console.error("Course fetch error:", error);
    res.status(500).json({ message: "Failed to fetch courses." });
  }
};

// ✅ Get faculty dashboard data
exports.getDashboard = async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied: Faculty only.' });
    }

    const faculty = await Faculty.findById(req.user.id).select('-password');

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    const courses = await TestCourse.find({ faculty: req.user.id });

    res.json({
      name: faculty.name,
      email: faculty.email,
      courses
    });

  } catch (err) {
    console.error("❌ Faculty dashboard error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStudentsInCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // Find the course and populate the student list
    const course = await TestCourse.findById(courseId).populate('students');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json(course.students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};