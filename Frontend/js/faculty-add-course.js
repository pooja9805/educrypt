

document.addEventListener("DOMContentLoaded", () => {
  const addCourseForm = document.getElementById("addCourseForm");
  const token = localStorage.getItem("token");
  console.log("📦 Retrieved Token:", token); // ✅ Log the token
  addCourseForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const courseId = document.getElementById("courseId").value.trim();
    const name = document.getElementById("courseName").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!courseId || !name || !description) {
      alert("⚠️ Please fill out all fields.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/faculty/create-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId, name, description })
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Course added successfully!");
        addCourseForm.reset();
      } else {
        console.log(data)
        console.log(data.token);
        
        alert(`❌ ${data.message || "Failed to add course."} secretKey:${data.dec}`);
      }
    } catch (err) {
      console.error("❌ Error creating course:", err);
      alert("❌ Server error. Please try again later.");
    }
  });
});
