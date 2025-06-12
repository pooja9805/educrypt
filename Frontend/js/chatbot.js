const sendBtn = document.getElementById("sendBtn");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const token = localStorage.getItem("token");

sendBtn?.addEventListener("click", handleSend);

chatInput?.addEventListener("keypress", function (e) {
  if (e.key === "Enter") handleSend();
});

async function handleSend() {
  const message = chatInput.value.trim();
  if (!message) return;

  // Show user message
  const userMsg = document.createElement("div");
  userMsg.className = "chat-bubble user";
  userMsg.textContent = message;
  chatMessages.appendChild(userMsg);

  chatInput.value = "";

  // Bot is typing
  const botMsg = document.createElement("div");
  botMsg.className = "chat-bubble bot";
  botMsg.textContent = "🤖 Thinking...";
  chatMessages.appendChild(botMsg);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const res = await fetch("http://localhost:5000/api/chat/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    botMsg.innerHTML = formatResponse(data.reply || "⚠️ AI didn’t respond.");
  } catch (err) {
    botMsg.textContent = "❌ Error contacting AI.";
    console.error(err.message);
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formatResponse(text) {
  return text
    .replace(/```(.*?)```/gs, (_, code) => `<pre><code>${escapeHTML(code)}</code></pre>`)
    .replace(/\n/g, "<br>")
    .replace(/^- (.*)/gm, '• $1');
}

function escapeHTML(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
