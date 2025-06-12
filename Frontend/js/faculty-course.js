document.addEventListener("DOMContentLoaded", () => {
    const assignmentForm = document.getElementById("assignment-upload-form");
    const materialForm = document.getElementById("material-upload-form");
    const announcementForm = document.getElementById("announcement-form");
    const courseId = localStorage.getItem("selectedCourseId");
    const courseName = localStorage.getItem("selectedCourseName");
    const courseDescription = localStorage.getItem("selectedCourseDescription");
    const token = localStorage.getItem("token");
  
    if (!courseId) {
      alert("Course not found. Please go back to dashboard.");
      window.location.href = "faculty-dashboard.html";
      return;
    }
  
    // Set course title and description
    document.getElementById("course-name").textContent = courseName;
    document.getElementById("course-description").textContent = courseDescription;
  
    // Assignment Upload
    assignmentForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const title = document.getElementById("assignment-title").value.trim();
      const dueDate = document.getElementById("assignment-due-date").value;
      const description = document.getElementById("assignment-description").value.trim();
      const file = document.getElementById("assignment-file").files[0];
  
      if (!file || !courseId) {
        alert("File or Course ID missing!");
        return;
      }
  
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("dueDate", dueDate);
      formData.append("file", file);
      formData.append("courseId", courseId);
  
      try {
        const response = await fetch("http://localhost:5000/api/assignments/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
  
        const result = await response.json();
  
        if (response.ok) {
          alert("✅ Assignment uploaded successfully!");
          assignmentForm.reset();
          fetchAssignments(courseId);
        } else {
          alert("❌ Failed to upload assignment: " + result.message);
        }
      } catch (error) {
        console.error("Error uploading assignment:", error);
        alert("❌ Something went wrong. Check console for details.");
      }
    });
  
    // Material Upload
    materialForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const file = document.getElementById("material-file").files[0];
  
      if (!file || !courseId) {
        alert("File or Course ID missing!");
        return;
      }
  
      const formData = new FormData();
      formData.append("file", file);
      formData.append("courseId", courseId);
  
      try {
        const response = await fetch("http://localhost:5000/api/assignments/materials/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
  
        const result = await response.json();
  
        if (response.ok) {
          alert("✅ Material uploaded successfully!");
          materialForm.reset();
          fetchMaterials(courseId);
        } else {
          alert("❌ Failed to upload material: " + result.message);
        }
      } catch (error) {
        console.error("Error uploading material:", error);
        alert("❌ Something went wrong. Check console for details.");
      }
    });
  
    // Announcement Post (Text-Only)
    announcementForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const textarea = announcementForm.querySelector("textarea");
      const message = textarea.value.trim();
  
      if (!message || !courseId) {
        alert("Message or Course ID missing!");
        return;
      }
  
      try {
        const response = await fetch("http://localhost:5000/api/assignments/announcements", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ courseId, message }),
        });
  
        const result = await response.json();
  
        if (response.ok) {
          alert("📣 Announcement posted!");
          textarea.value = "";
          fetchAnnouncements(courseId);
        } else {
          alert("❌ Failed to post announcement: " + result.message);
        }
      } catch (error) {
        console.error("Error posting announcement:", error);
        alert("❌ Something went wrong. Check console for details.");
      }
    });
  
    // Fetch Assignments
    async function fetchAssignments(courseId) {
      try {
        const res = await fetch(`http://localhost:5000/api/assignments/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const assignments = await res.json();
        const container = document.getElementById("uploadedAssignmentsContainer");
        container.innerHTML = "";
  
        if (Array.isArray(assignments)) {
          assignments.forEach((assignment) => {
            const div = document.createElement("div");
            div.classList.add("assignment-card");
  
            const uploadedDate = new Date(assignment.createdAt).toLocaleDateString();
            const dueDate = new Date(assignment.dueDate).toLocaleDateString();
  
            div.innerHTML = `
              <h4>${assignment.title}</h4>
              <p><strong>Description:</strong> ${assignment.description}</p>
              <p><strong>Due Date:</strong> ${dueDate}</p>
              <p><strong>Uploaded On:</strong> ${uploadedDate}</p>
              <p><a href="http://localhost:5000/${assignment.filePath}" target="_blank">📄 View Assignment File</a></p>
              <button class="view-submissions-btn" data-assignment-id="${assignment._id}">👀 View Submissions</button>
            `;
  
            container.appendChild(div);
          });
  
          document.querySelectorAll(".view-submissions-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
              const assignmentId = e.target.getAttribute("data-assignment-id");
              viewSubmissions(assignmentId);
            });
          });
        }
      } catch (err) {
        console.error("Error fetching assignments:", err);
      }
    }
  
    // Fetch Materials
    async function fetchMaterials(courseId) {
      try {
        const res = await fetch(`http://localhost:5000/api/assignments/materials/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const materials = await res.json();
        const container = document.getElementById("materialsList");
        container.innerHTML = "";
  
        if (Array.isArray(materials)) {
          materials.forEach((mat) => {
            const div = document.createElement("div");
            div.classList.add("material-card");
  
            const uploadedDate = new Date(mat.createdAt).toLocaleDateString();
  
            div.innerHTML = `
              <p><strong>Uploaded On:</strong> ${uploadedDate}</p>
              <p><a href="http://localhost:5000/${mat.filePath}" target="_blank">📄 View Material</a></p>
            `;
  
            container.appendChild(div);
          });
        }
      } catch (err) {
        console.error("Error fetching materials:", err);
      }
    }
  
    // Fetch Announcements
    async function fetchAnnouncements(courseId) {
      try {
        const res = await fetch(`http://localhost:5000/api/assignments/announcements/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const announcements = await res.json();
        const container = document.getElementById("announcementsList");
        container.innerHTML = "";
  
        if (Array.isArray(announcements)) {
          announcements.forEach((a) => {
            const div = document.createElement("div");
            div.classList.add("announcement-card");
  
            const postedDate = new Date(a.createdAt).toLocaleString();
  
            div.innerHTML = `
              <p>${a.message}</p>
              <small><em>Posted on: ${postedDate}</em></small>
            `;
  
            container.appendChild(div);
          });
        }
      } catch (err) {
        console.error("Error fetching announcements:", err);
      }
    }
  
    async function viewSubmissions(assignmentId) {
      const popup = document.getElementById("submissionPopup");
      const listContainer = document.getElementById("submissionList");
    
      try {
        // Show the popup only when button is clicked
        popup.classList.remove("hidden");
    
        const res = await fetch(`http://localhost:5000/api/submissions/assignment/${assignmentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
    
        const data = await res.json();
        const submissions = data.submissions || [];
    
        if (submissions.length === 0) {
          listContainer.innerHTML = `<p>No student submissions yet.</p>`;
          return;
        }
    
        // Clear old submissions
        listContainer.innerHTML = "";
    
        // Append each submission as its own block
        submissions.forEach(sub => {
          const block = document.createElement("div");
          block.className = "student-submission";
          block.innerHTML = `
            <p>👤 <strong>${sub.student.name}</strong> (${sub.student.username})</p>
            <a href="http://localhost:5000/${sub.filePath}" target="_blank" class="text-[#00d8ff] underline">📄 View File</a>
          `;
          listContainer.appendChild(block);
        });
      } catch (err) {
        console.error("❌ Failed to load submissions:", err);
        listContainer.innerHTML = `<p>Error loading submissions.</p>`;
      }
    }
    
    // Also add this for the Close button functionality
    document.getElementById("closePopupBtn").addEventListener("click", () => {
      document.getElementById("submissionPopup").classList.add("hidden");
    });
        
    // Initial load
    fetchAssignments(courseId);
    fetchMaterials(courseId);
    fetchAnnouncements(courseId);

    // 🔄 Edit Course
document.getElementById("edit-course").addEventListener("click", async () => {
  const newName = prompt("Enter new course title:", courseName);
  const newDesc = prompt("Enter new course description:", courseDescription);

  if (newName && newDesc) {
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName, description: newDesc })
      });

      const result = await res.json();

      if (res.ok) {
        alert("✅ Course updated successfully!");
        location.reload();
      } else {
        alert("❌ Update failed: " + result.message);
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  }
});

// 🗑️ Delete Course
document.getElementById("delete-course").addEventListener("click", async () => {
  const confirmDelete = confirm("Are you sure you want to delete this course?");

  if (confirmDelete) {
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await res.json();

      if (res.ok) {
        alert("🗑️ Course deleted successfully!");
        window.location.href = "faculty-dashboard.html";
      } else {
        alert("❌ Delete failed: " + result.message);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  }
});

});
  