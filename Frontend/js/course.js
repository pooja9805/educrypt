document.addEventListener("DOMContentLoaded", () => {
  const courseId = localStorage.getItem("selectedCourseId");
  const courseName = localStorage.getItem("selectedCourseName");
  const courseDescription = localStorage.getItem("selectedCourseDescription");
  const token = localStorage.getItem("token");
  const studentId = localStorage.getItem("userId");

  const titleEl = document.getElementById("courseTitle");
  const descEl = document.getElementById("courseDescription");
  const announcementList = document.getElementById("announcementList");
  const materialsList = document.getElementById("materialsList");
  const assignmentsContainer = document.getElementById("assignmentsContainer");

  if (!courseId || !token || !studentId) {
    alert("🚫 Course or token missing. Please go back to dashboard.");
    window.location.href = "student-dashboard.html";
    return;
  }

  titleEl.textContent = courseName || "Course Title";
  descEl.textContent = courseDescription || "Course description not available.";

  async function fetchAnnouncements() {
    try {
      const res = await fetch(`http://localhost:5000/api/students/announcements/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const announcements = await res.json();
      announcementList.innerHTML = "";
      announcements.forEach(a => {
        const postedDate = new Date(a.createdAt).toLocaleString();
        const div = document.createElement("div");
        div.className = "content-block";
        div.innerHTML = `
          <h3>📣 Announcement</h3>
          <p>${a.message}</p>
          <small><em>Posted on: ${postedDate}</em></small>
        `;
        announcementList.appendChild(div);
      });
    } catch (err) {
      console.error("❌ Error loading announcements:", err);
    }
  }

  async function fetchMaterials() {
    try {
      const res = await fetch(`http://localhost:5000/api/students/materials/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const materials = await res.json();
      materialsList.innerHTML = "";
      materials.forEach(m => {
        const date = new Date(m.createdAt).toLocaleDateString();
        const div = document.createElement("div");
        div.className = "content-block";
        div.innerHTML = `
          <h3>📚 ${m.originalname}</h3>
          <p><strong>Uploaded:</strong> ${date}</p>
          <a href="http://localhost:5000/${m.filePath}" target="_blank">📄 View Material</a>
        `;
        materialsList.appendChild(div);
      });
    } catch (err) {
      console.error("❌ Error loading materials:", err);
    }
  }

  async function fetchAssignments() {
    try {
      const res = await fetch(`http://localhost:5000/api/students/assignments/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const assignments = await res.json();
      assignmentsContainer.innerHTML = "";

      for (const a of assignments) {
        const due = new Date(a.dueDate).toLocaleString();
        const assignmentBlock = document.createElement("div");
        assignmentBlock.className = "content-block";

        const submissionRes = await fetch(`http://localhost:5000/api/submissions/assignment/${a._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await submissionRes.json();
        const submissions = result.submissions || [];
        
        const mySubmission = submissions.find(
          s => s.student?._id === studentId && s.assignment === a._id
        );
        console.log("📁 Submission:- ", mySubmission);
        console.log("🔍 studentId (localStorage):", studentId);
        console.log("🔍 assignmentId (from loop):", a._id);
        console.log("📦 allSubmissions:", submissions);

        let assignmentHTML = `
          <h3>📌 ${a.title}</h3>
          <p>${a.description || "No description provided."}</p>
          <p><strong>Due:</strong> ${due}</p>
          <a href="http://localhost:5000/${a.filePath}" target="_blank">📄 View Assignment File</a><br>
        `;

        if (mySubmission) {
          assignmentHTML += `
            <p class="text-green-400 mt-2">✅ You have successfully uploaded this assignment.</p>
            <button class="mt-2 bg-gray-700 text-white px-4 py-1 rounded" onclick="accessMySubmission('${mySubmission._id}')">🔐 Access My Submission</button>
          `;
        } else {
          assignmentHTML += `
            <button class="mt-2 bg-[#00d8ff] text-black px-4 py-1 rounded font-bold" onclick="uploadAssignment('${a._id}')">Upload Assignment</button>
          `;
        }

        assignmentBlock.innerHTML = assignmentHTML;
        assignmentsContainer.appendChild(assignmentBlock);
      }
    } catch (err) {
      console.error("❌ Error loading assignments:", err);
    }
  }

  fetchAnnouncements();
  fetchMaterials();
  fetchAssignments();
});

function uploadAssignment(assignmentId) {
  localStorage.setItem("selectedAssignmentId", assignmentId);
  window.location.href = "upload-assignment.html";
}

function accessMySubmission(submissionId) {
  const key = prompt("🔐 Enter your encryption key to access your submission:");
  if (!key) return;

  fetch(`http://localhost:5000/api/submissions/access/${submissionId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ password: key })
  })
    .then(res => res.json())
    .then(data => {
      if (data.filePath) {
        const cleanPath = data.filePath.replace(/\\/g, "/");
        window.open(`http://localhost:5000/${cleanPath}`, "_blank");
      } else {
        alert("❌ Incorrect encryption key. Access denied.");
      }
    })
    .catch(err => {
      console.error("❌ Failed to access submission:", err);
      alert("Error accessing submission.");
    });
}

