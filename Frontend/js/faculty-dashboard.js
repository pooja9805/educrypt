function logout() {
  alert("Logging out...");
  localStorage.removeItem("token");
  window.location.href = "../html/index.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  console.log("🔐 Token:", token);
  console.log("👤 User ID:", userId);
  console.log("🎓 Role:", role);
  
  if (!token) {
    window.location.href = "faculty-login.html";
    console.error("No token found");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/faculty/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.status === 403) {
      alert("Unauthorized access.");
      window.location.href = "faculty-login.html";
      return;
    }

    const data = await res.json();
    const { name, photoUrl, courses } = data;

    // Set faculty name and photo
    document.getElementById("facultyName").textContent = name;
    document.getElementById("facultyPhoto").src = photoUrl || "../assets/default-profile.png";

    // Populate the faculty's courses
    const container = document.getElementById("coursesContainer");
    container.innerHTML = ""; // Clear previous content

    if (courses && courses.length > 0) {
      courses.forEach(course => {
        const card = document.createElement("div");
        card.className = "course-card";
        card.innerHTML = `
          <h3>${course.name}</h3>
          <p><strong>Description:</strong> ${course.description}</p>
        `;

        // 👇 Add click listener to store courseId and redirect
        card.addEventListener("click", () => {
          localStorage.setItem("selectedCourseId", course._id); // storing courseId
          localStorage.setItem("selectedCourseName", course.name); // optional
          localStorage.setItem("selectedCourseDescription", course.description); // optional
          window.location.href = "faculty-course.html";
        });

        container.appendChild(card);
      });
    } else {
      container.innerHTML = "<p>No courses found.</p>";
    }

  } catch (err) {
    console.error("Failed to load faculty dashboard:", err);
  }
  
  
});
document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("sendBtn");
  const chatInput = document.getElementById("chatInput");
  const chatWindow = document.getElementById("chat-window");
  const chatContainer = document.getElementById("chat-container");
  const toggleChatButton = document.getElementById("toggleChatButton");

  // Toggle Chat
  toggleChatButton.addEventListener("click", () => {
    const isHidden = chatContainer.style.display === "none";
    chatContainer.style.display = isHidden ? "flex" : "none";

    // If just opened and input has content, auto-send
    if (isHidden && chatInput.value.trim()) {
      sendMessage();
    }
  });

  // Send Button or Enter Key
  sendBtn.addEventListener("click", sendMessage);
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  function sendMessage() {
    const userInput = chatInput.value.trim();
    if (!userInput) return;

    appendChatBubble(userInput, "user");
    chatInput.value = "";

    fetch("http://localhost:5000/api/chat/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userInput }),  // Send message to the server
    })
      .then((res) => res.json())
      .then((data) => {
        appendChatBubble(data.reply || "No reply from AI", "bot");
      })
      .catch(() => {
        appendChatBubble("Sorry, something went wrong.", "bot");
      });
  }

  function appendChatBubble(message, sender) {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${sender}`;
    bubble.innerText = message;
    chatWindow.appendChild(bubble);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
});

