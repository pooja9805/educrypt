document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const assignmentId = params.get("assignmentId");
  
    if (!assignmentId) {
      alert("Invalid assignment access.");
      return;
    }
  
    // Load assignment info
    fetch(`/api/assignments/${assignmentId}`)
      .then(res => res.json())
      .then(data => {
        document.getElementById("assignment-title").textContent = data.title;
        document.getElementById("assignment-desc").textContent = data.description;
        document.getElementById("uploaded-at").textContent = new Date(data.uploadedAt).toLocaleString();
        document.getElementById("due-date").textContent = new Date(data.dueDate).toLocaleString();
        document.getElementById("assignment-file-preview").src = data.fileUrl;
      })
      .catch(err => {
        console.error(err);
        alert("Failed to load assignment data.");
      });
  
    // Upload assignment form
    document.getElementById("upload-assignment-form").addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const form = e.target;
      const file = form.solution.files[0];
      const encryptionKey = form.encryptionKey.value;
  
      if (file.size > 4096 * 1024) {
        alert("Max file size is 4MB.");
        return;
      }
  
      const formData = new FormData();
      formData.append("assignmentId", assignmentId);
      formData.append("file", file);
      formData.append("encryptionKey", encryptionKey);
  
      const res = await fetch("/api/assignments/submit", {
        method: "POST",
        body: formData
      });
  
      const result = await res.json();
      document.getElementById("upload-status").textContent = result.message || "Submitted successfully!";
    });
  });
  