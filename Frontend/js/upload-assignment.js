document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("uploadForm");
    const fileInput = document.getElementById("assignmentFile");
    const keyInput = document.getElementById("encryptionKey");
    const statusMsg = document.getElementById("statusMessage");
  
    const token = localStorage.getItem("token");
    const assignmentId = localStorage.getItem("selectedAssignmentId");
    const studentId = localStorage.getItem("userId");
  
    const submittedBlock = document.createElement("div");
    submittedBlock.className = "content-block mt-6";
    document.body.appendChild(submittedBlock);
  
    if (!assignmentId || !token || !studentId) {
      alert("Invalid access. Assignment not selected.");
      window.location.href = "student-dashboard.html";
      return;
    }
  
    // 🔁 Check if user already uploaded
    async function checkExistingSubmission() {
      try {
        const res = await fetch(`http://localhost:5000/api/submissions/assignment/${assignmentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        const data = await res.json();
        const submissions = Array.isArray(data) ? data : data.submissions;
  
        const mySubmission = submissions.find(sub => sub.student?._id === studentId);
  
        if (mySubmission) {
          form.style.display = "none";
          submittedBlock.innerHTML = `
            <h3>✅ Assignment Submitted Successfully</h3>
            <p>You can view your submitted file below:</p>
            <button class="bg-[#00d8ff] text-black px-4 py-1 rounded font-bold mt-2" id="viewMySubmissionBtn">🔓 View My Submission</button>
            <div id="submissionFileViewer" class="mt-4 hidden"></div>
          `;
          localStorage.setItem(`submitted_${assignmentId}`, "true"); // ✅ Remember for reload
  
          const viewBtn = document.getElementById("viewMySubmissionBtn");
          const viewer = document.getElementById("submissionFileViewer");
  
          viewBtn.addEventListener("click", () => {
            const enteredKey = prompt("🔐 Enter your encryption key to view the file:");
            if (enteredKey === mySubmission.password) {
              const cleanPath = mySubmission.filePath.replace(/\\/g, "/");
              const fileName = cleanPath.split("/").pop();
          
              
            viewer.innerHTML = `
            <p><strong>Filename:</strong> ${fileName}</p>
            <a href="http://localhost:5000/${cleanPath}" target="_blank" class="text-[#00d8ff] underline">📄 View File</a>
            `;
              viewer.classList.remove("hidden");
            } else {
              alert("❌ Incorrect encryption key.");
            }
          });
          
  
        } else {
          console.log("ℹ️ No submission found for this student.");
        }
  
      } catch (err) {
        console.error("❌ Failed to fetch existing submissions:", err);
      }
    }
  
    // ✅ On initial load, skip form if already submitted
    if (localStorage.getItem(`submitted_${assignmentId}`) === "true") {
      form.style.display = "none";
    }
  
    // 📝 Submit handler
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const file = fileInput.files[0];
      const password = keyInput.value.trim();
  
      if (!file || !password) {
        statusMsg.textContent = "❌ File and encryption key are required.";
        return;
      }
  
      const formData = new FormData();
      formData.append("file", file);
      formData.append("password", password);
      formData.append("assignmentId", assignmentId);
  
      try {
        const res = await fetch("http://localhost:5000/api/submissions/submit", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });
  
        const result = await res.json();
        console.log("🧾 Upload response:", result);
        console.log("✅ Upload status:", res.ok);
        console.log("👤 Local studentId:", studentId);
        //console.log("📬 All submissions from server:", submissions);

        if (res.ok) {
          localStorage.setItem(`submitted_${assignmentId}`, "true"); // ✅ Save flag
          form.reset();
          form.style.display = "none";
          statusMsg.textContent = ""; // clear previous
  
          await checkExistingSubmission(); // show file + confirmation
        } else {
          statusMsg.textContent = "❌ Upload failed: " + result.message;
        }
      } catch (err) {
        console.error("Upload Error:", err);
        statusMsg.textContent = "❌ Something went wrong. Try again.";
      }
    });
  
    // First-time load
    checkExistingSubmission();
  });
  