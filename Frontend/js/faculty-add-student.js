const token = localStorage.getItem("token");
const courseSearch = document.getElementById("courseSearch");
const courseSuggestions = document.getElementById("courseSuggestions");
const selectedCourses = document.getElementById("selectedCourses");

let allCourses = [];
let selectedCourseIds = [];

// ✅ Load all courses
async function loadCourses() {
  try {
    const res = await fetch("http://localhost:5000/api/faculty/all-courses", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    allCourses = data.courses || [];
  } catch (err) {
    console.error("Course fetch error:", err);
  }
}

// 🔍 Handle course search
courseSearch.addEventListener("input", () => {
  const query = courseSearch.value.toLowerCase();
  courseSuggestions.innerHTML = "";

  if (!query) return;

  const filtered = allCourses.filter(c =>
    c.name.toLowerCase().includes(query)
  );

  filtered.forEach(course => {
    const div = document.createElement("div");
    div.textContent = `${course.name} (${course.courseId})`;
    div.dataset.id = course._id;

    div.addEventListener("click", () => {
      if (!selectedCourseIds.includes(course._id)) {
        selectedCourseIds.push(course._id);
        renderSelectedCourses();
      }
      courseSuggestions.innerHTML = "";
      courseSearch.value = "";
    });

    courseSuggestions.appendChild(div);
  });
});

function renderSelectedCourses() {
  selectedCourses.innerHTML = "";
  selectedCourseIds.forEach(id => {
    const course = allCourses.find(c => c._id === id);
    const tag = document.createElement("span");
    tag.textContent = course.name;
    selectedCourses.appendChild(tag);
  });
}

// 🧪 On form submission, include selectedCourseIds
document.getElementById("addStudentForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("studentName").value.trim();
  const username = document.getElementById("studentUsername").value.trim();
  const email = document.getElementById("studentEmail").value.trim().toLowerCase();
  
  
  const studentData = {
    name,
    username,
    email,
    courseIds: selectedCourseIds,
  };

  try {
    const res = await fetch("http://localhost:5000/api/faculty/add-student", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(studentData)
    });
  
    const result = await res.json();  // ✅ always await result
  
    if (!res.ok) {
      // ⛔ Show server error message (like 409 Conflict)
      alert(result.message || "Something went wrong while adding student.");
      throw new Error(result.message); // Optional to stop further execution
    }
  
    // ✅ Everything successful
    alert("✅ Student registered successfully!");
    console.log("Student Added:", result);
    document.getElementById("addStudentForm").reset();
  
  } catch (err) {
    console.error("❌ Failed to add student:", err);
    alert("❌ Failed to add student: " + err.message);
  }
});

// Initialize
loadCourses();
