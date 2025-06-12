const API_BASE = 'http://localhost:5000';
const token = localStorage.getItem("token");
const courseDropdown = document.getElementById("courseDropdown");
const studentList = document.getElementById("studentList");
const attendanceDateInput = document.getElementById("attendanceDate");
const feedback = document.getElementById("feedbackMessage");

let selectedCourseId = null;
let studentsData = [];

function getToday() {
  const today = new Date().toISOString().split("T")[0];
  attendanceDateInput.value = today;
}

async function fetchCourses() {
  const res = await fetch(`${API_BASE}/api/faculty/my-courses`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const courses = await res.json();
  courses.forEach(course => {
    const option = document.createElement("option");
    option.value = course._id;
    option.textContent = `${course.name} (${course.courseId})`;
    courseDropdown.appendChild(option);
  });
  document.getElementById("attendancePanel").style.display = "block";
}

courseDropdown.addEventListener("change", async (e) => {
  selectedCourseId = e.target.value;
  studentList.innerHTML = "";

  const res = await fetch(`${API_BASE}/api/faculty/course/${selectedCourseId}/students`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  if (!Array.isArray(data)) {
    feedback.innerText = "⚠️ Failed to load students.";
    feedback.className = "feedback error";
    console.error("Expected students array, got:", data);
    return;
  }

  studentsData = data;

  studentsData.forEach((student) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>${student.name}</div>
      <div>
        <label><input type="radio" name="attendance-${student._id}" value="Present" checked> Present</label>
        <label><input type="radio" name="attendance-${student._id}" value="Absent"> Absent</label>
      </div>
    `;
    studentList.appendChild(li);
  });
});

async function submitAttendance() {
  const attendanceDate = attendanceDateInput.value;
  if (!selectedCourseId || !attendanceDate) {
    feedback.textContent = "Select course and date";
    feedback.className = "feedback error";
    return;
  }

  const records = studentsData.map(student => {
    const status = document.querySelector(`input[name="attendance-${student._id}"]:checked`).value;
    return { studentId: student._id, status };
  });

  const res = await fetch(`${API_BASE}/api/attendance/mark`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      courseId: selectedCourseId,
      date: attendanceDate,
      records
    })
  });

  const data = await res.json();

  if (res.ok) {
    // ✅ Save student names and statuses for summary
    const recordsWithNames = records.map(rec => {
      const student = studentsData.find(s => s._id === rec.studentId);
      return {
        studentId: rec.studentId,
        status: rec.status,
        name: student?.name || "Unknown"
      };
    });

    localStorage.setItem("attendanceRecords", JSON.stringify(recordsWithNames));
    localStorage.setItem("lastCourseId", selectedCourseId);
    localStorage.setItem("lastAttendanceDate", attendanceDate);

    // ✅ Redirect to summary page
    window.location.href = "attendance-summary.html";
  } else {
    feedback.textContent = data.message || "Submit failed.";
    feedback.className = "feedback error";
  }
}

getToday();
fetchCourses();
