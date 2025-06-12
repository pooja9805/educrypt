const apiBase = "http://localhost:5000/api/notes";
const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");
const userType = localStorage.getItem("role") || localStorage.getItem("userType");

console.log("User Type:", userType);
console.log("User ID:", userId);
console.log("Token:", token);
console.log("API Base:", apiBase);

if (!userId || !token || !userType) {
  alert("Authentication error. Please log in again.");
  const rolePage = userType === "student" ? "student-login.html" : "faculty-login.html";
  window.location.href = rolePage;
}

const notesSection = document.getElementById("notesSection");
const todoSection = document.getElementById("todoSection");

// Sidebar toggle
document.getElementById("nav-notes").addEventListener("click", () => {
  notesSection.classList.add("visible");
  todoSection.classList.remove("visible");
  document.getElementById("nav-notes").classList.add("active");
  document.getElementById("nav-todos").classList.remove("active");
});

document.getElementById("nav-todos").addEventListener("click", () => {
  todoSection.classList.add("visible");
  notesSection.classList.remove("visible");
  document.getElementById("nav-todos").classList.add("active");
  document.getElementById("nav-notes").classList.remove("active");
});

// ================= NOTES =================
async function fetchNotes() {
  try {
    const res = await fetch(`${apiBase}/${userId}`, {
      headers: { Authorization: `Bearer ${token}`, "x-usertype": userType }
    });
    const data = await res.json();
    renderNotes(data);
  } catch (err) {
    alert("❌ Failed to fetch notes");
    console.error(err);
  }
}

function renderNotes(notes) {
  const container = document.getElementById("notesList");
  container.innerHTML = "";

  notes.forEach(note => {
    const div = document.createElement("div");
    div.className = "note-item";
    div.innerHTML = `
      <h3>${note.title}</h3>
      <p>${note.content}</p>
      <button onclick="editNote('${note._id}', \`${note.title}\`, \`${note.content}\`)">Update</button>
      <button onclick="deleteNote('${note._id}')">Delete</button>
    `;
    container.appendChild(div);
  });
}

async function deleteNote(id) {
  await fetch(`${apiBase}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  alert("🗑️ Note deleted");
  fetchNotes();
}

function editNote(id, title, content) {
  document.getElementById("noteTitle").value = title;
  document.getElementById("noteContent").value = content;
  document.getElementById("noteForm").dataset.editing = id;
}

document.getElementById("noteForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("noteTitle").value.trim();
  const content = document.getElementById("noteContent").value.trim();
  const editId = e.target.dataset.editing;

  const note = { title, content, userId, userType };

  if (editId) {
    await fetch(`${apiBase}/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(note)
    });
    e.target.removeAttribute("data-editing");
    alert("📝 Note updated");
  } else {
    await fetch(apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(note)
    });
    alert("✅ Note created");
  }

  e.target.reset();
  fetchNotes();
});

// ================= TO-DOS =================
const taskContainer = document.getElementById("taskContainer");

function addTaskInput(text = "", done = false) {
  const div = document.createElement("div");
  div.className = "task-input";
  div.innerHTML = `
    <input type="checkbox" class="task-check" ${done ? "checked" : ""} />
    <input type="text" value="${text}" placeholder="Task description..." required class="task-text"/>
  `;
  taskContainer.appendChild(div);
}

document.getElementById("addTask").addEventListener("click", () => {
  addTaskInput();
});

async function fetchTodos() {
  try {
    const res = await fetch(`${apiBase}/todo/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-usertype": userType
      }
    });
    const data = await res.json();
    renderTodos(data);
  } catch (err) {
    alert("❌ Failed to fetch todos");
    console.error(err);
  }
}

function renderTodos(todos) {
  const container = document.getElementById("todosList");
  container.innerHTML = "";

  todos.forEach(todo => {
    const div = document.createElement("div");
    div.className = "todo-item";
    const tasks = todo.tasks || [];

    div.innerHTML = `
      <h3>${todo.title}</h3>
      <ul>
        ${tasks.map(t => `<li><input type="checkbox" ${t.done ? "checked" : ""} disabled class="small-checkbox"> ${t.text}</li>`).join("")}
      </ul>
      <button onclick='editTodo("${todo._id}", \`${todo.title}\`, ${JSON.stringify(tasks)})'>Update</button>
      <button onclick="deleteTodo('${todo._id}')">Delete</button>
    `;
    container.appendChild(div);
  });
}

function editTodo(id, title, tasks) {
  document.getElementById("todoTitle").value = title;
  taskContainer.innerHTML = "";
  tasks.forEach(task => addTaskInput(task.text, task.done));
  document.getElementById("todoForm").dataset.editing = id;
}

async function deleteTodo(id) {
  await fetch(`${apiBase}/todo/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  alert("🗑️ To-Do deleted");
  fetchTodos();
}

document.getElementById("todoForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("todoTitle").value.trim();
  const editId = e.target.dataset.editing;

  const tasks = Array.from(taskContainer.children).map(div => {
    const textInput = div.querySelector('input[type="text"]');
    const checkbox = div.querySelector('input[type="checkbox"]');
    return {
      text: textInput?.value.trim() || "",
      done: checkbox?.checked || false
    };
  }).filter(task => task.text !== "");

  if (!title || tasks.length === 0 || !tasks[0].text.trim()) {
    return alert("❗ Please provide title and at least one task.");
  }

  const todo = {
    title,
    tasks,
    userId,
    userType,
    dueDate: new Date(),
  };

  try {
    const response = await fetch(`${apiBase}/todo${editId ? `/${editId}` : ""}`, {
      method: editId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(todo)
    });

    const result = await response.json();
    if (response.ok) {
      alert(`✅ To-Do ${editId ? "updated" : "created"} successfully`);
      e.target.reset();
      taskContainer.innerHTML = "";
      fetchTodos();
    } else {
      throw new Error(result.message || "Error saving To-Do");
    }
  } catch (err) {
    console.error("❌ Error saving To-Do:", err);
    alert("❌ Failed to save To-Do");
  }
});

// Load on page
fetchNotes();
fetchTodos();
