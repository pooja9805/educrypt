//const token = localStorage.getItem("token");
const chatMessages = document.getElementById("chatMessages");

document.addEventListener("DOMContentLoaded", async () => {
  if (!token) {
    console.warn("🚫 No token found, redirecting to login...");
    window.location.href = "student-login.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/students/dashboard", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();

    console.log("📦 Full API Response:", data); // 🧠 SHOW ENTIRE RESPONSE

    if (!res.ok) {
      console.error("Dashboard error:", data.message);
      document.getElementById("coursesContainer").innerHTML =
        `<p>${data.message || "Failed to load dashboard."}</p>`;
      return;
    }

    // ✅ Student Name
    const studentNameEl = document.getElementById("studentName");
    if (studentNameEl && data.name) {
      studentNameEl.textContent = data.name;
    }

    // ✅ Check if courses exist
    const container = document.getElementById("coursesContainer");
    if (!container) return;

    container.innerHTML = "";

    if (!data.courses || !Array.isArray(data.courses) || data.courses.length === 0) {
      console.warn("⚠️ No enrolled courses found.");
      container.innerHTML = "<p>You are not enrolled in any courses yet.</p>";
      return;
    }

    console.log("📚 Courses to render:", data.courses);

    data.courses.forEach((course, index) => {
      console.log(`📘 Course #${index + 1}:`, course);

      const card = document.createElement("div");
      card.className = "course-card";
      card.innerHTML = `
        <h3>${course.name}</h3>
        <p><strong>Course ID:</strong> ${course.courseId}</p>
        <p>${course.description}</p>
      `;

      container.appendChild(card);

      card.addEventListener("click", () => {
        console.log("✅ Course clicked:", course);
        console.log("🧠 _id:", course._id);
        console.log("🧠 name:", course.name);
        console.log("🧠 description:", course.description);

        if (!course._id) {
          alert("❌ Course ID (_id) missing in this course object!");
          return;
        }

        localStorage.setItem("selectedCourseId", course._id);
        localStorage.setItem("selectedCourseName", course.name);
        localStorage.setItem("selectedCourseDescription", course.description);

        console.log("📥 Stored courseId in localStorage:", localStorage.getItem("selectedCourseId"));
        window.location.href = "../html/course.html";
      });
    });

  } catch (error) {
    console.error("❌ Failed to load dashboard:", error.message);
    const container = document.getElementById("coursesContainer");
    if (container) {
      container.innerHTML = "<p>Failed to load courses due to network error.</p>";
    }
  }
});

sendBtn.addEventListener("click", async () => {
  const message = chatInput.value.trim();
  if (!message) return;

  addUserMessage(message);
  addTypingBubble();

  try {
    const res = await fetch("http://localhost:5000/api/chat/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    removeTypingBubble();
    renderBotReply(data.reply || "⚠️ AI didn’t respond.");
  } catch (error) {
    removeTypingBubble();
    renderBotReply("❌ Failed to connect to AI.");
    console.error("AI error:", error);
  }
});

// User message bubble
function addUserMessage(message) {
  const bubble = document.createElement("div");
  bubble.classList.add("chat-bubble", "user");
  bubble.textContent = message;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Typing placeholder
function addTypingBubble() {
  const typing = document.createElement("div");
  typing.classList.add("chat-bubble", "bot", "typing");
  typing.textContent = "🤖 Typing...";
  typing.id = "typing-bubble";
  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingBubble() {
  const bubble = document.getElementById("typing-bubble");
  if (bubble) bubble.remove();
}

// Bot reply
function renderBotReply(reply) {
  const botBubble = document.createElement("div");
  botBubble.classList.add("chat-bubble", "bot");

  const formatted = reply
    .replace(/```(.*?)```/gs, (match, code) => {
      const highlighted = escapeHTML(code);
      return `<pre><code>${highlighted}</code></pre>`;
    })
    .replace(/\n/g, "<br>")
    .replace(/^- (.*)/gm, '• $1');

  botBubble.innerHTML = formatted;
  chatMessages.appendChild(botBubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function escapeHTML(str) {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
}
const chatbotInput = document.querySelector(".chatbot-footer input");
const sendButton = document.querySelector(".chatbot-footer .fa-paper-plane");

sendButton.addEventListener("click", async () => {
  const message = chatbotInput.value.trim();
  if (!message) return;

  // Show loading
  const output = document.createElement("p");
  output.textContent = "⏳ Thinking...";
  document.querySelector(".chatbot-footer").appendChild(output);

  try {
    const res = await fetch("http://localhost:5000/api/chat/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Optional if protected
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    output.textContent = data.reply || "🤖 AI didn’t respond properly.";
  } catch (error) {
    output.textContent = "❌ AI error: " + error.message;
  }

  chatbotInput.value = "";
});
