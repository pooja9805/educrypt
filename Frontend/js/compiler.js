const languageSelector = document.getElementById("languageSelector");
const codeEditor = document.getElementById("codeEditor");
const outputConsole = document.getElementById("outputConsole");
const token = localStorage.getItem("token");

// 🔁 Dynamically load languages from backend
async function loadLanguages() {
  try {
    const res = await fetch("http://localhost:5000/api/compiler/languages");
    const data = await res.json();

    languageSelector.innerHTML = "";
    data.languages.forEach(lang => {
      const option = document.createElement("option");
      option.value = lang.id;
      option.textContent = lang.name;
      languageSelector.appendChild(option);
    });
  } catch (err) {
    console.error("Failed to load languages", err);
    languageSelector.innerHTML = `<option>Error loading</option>`;
  }
}

window.addEventListener("DOMContentLoaded", loadLanguages);

// ▶️ Run code
async function runCode() {
  const language = languageSelector.value;
  const code = codeEditor.value;

  if (!code.trim()) {
    outputConsole.textContent = "⚠️ Please enter some code.";
    return;
  }

  outputConsole.textContent = "⏳ Running your code...";

  try {
    const res = await fetch("http://localhost:5000/api/compiler/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ language, code })
    });

    const result = await res.json();
    console.log("Compiler API result:", result);

    if (result.output) {
      outputConsole.textContent = result.output;
    } else if (result.stdout) {
      outputConsole.textContent = result.stdout;
    } else if (result.error) {
      outputConsole.textContent = `❌ Error: ${result.error}`;
    } else {
      outputConsole.textContent = "⚠️ No output received. Check code or server.";
    }
    
    
  } catch (err) {
    outputConsole.textContent = "❌ Error during execution.";
    console.error(err);
  }
}

// 📄 Save code as DOC
function saveAsDoc() {
  const code = codeEditor.value;
  const blob = new Blob([code], { type: "application/msword" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "your_code.doc";
  link.click();
}

// 📤 Submit to assignment (Optional logic)
function submitToAssignment() {
  alert("📝 Feature coming soon! You'll be able to attach this file directly to an assignment.");
}
