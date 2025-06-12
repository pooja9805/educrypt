const token = localStorage.getItem("token");

async function saveSettings() {
  const name = document.getElementById("editName").value.trim();
  const email = document.getElementById("editEmail").value.trim();
  const fileInput = document.getElementById("profilePic");
  const file = fileInput.files[0];

  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  if (file) {
    formData.append("photo", file);
  }

  try {
    const res = await fetch("http://localhost:5000/api/students/update-profile", {
      method: "PUT",
      headers: { 
        Authorization: `Bearer ${token}`,
       },
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      alert("✅ Profile updated successfully!");
      console.log(data.student);
    } else {
      alert("❌ Failed to update profile: " + data.message);
    }
  } catch (err) {
    alert("❌ Error updating profile");
    console.error(err);
  }
}

// You can implement this later
function sendCourseRequest() {
  alert("📨 Feature coming soon...");
}
