let notes = [];

function saveNote() {
  const title = document.getElementById("noteTitle").value;
  const content = document.getElementById("noteContent").value;

  if (title && content) {
    notes.push({ title, content });
    updateNoteList();
    alert("Note saved successfully!");
  }
}

function createNewNote() {
  document.getElementById("noteTitle").value = "";
  document.getElementById("noteContent").value = "";
}

function updateNoteList() {
  const noteList = document.getElementById("noteList");
  noteList.innerHTML = "";
  notes.forEach((note, index) => {
    const li = document.createElement("li");
    li.textContent = note.title;
    li.onclick = () => loadNote(index);
    noteList.appendChild(li);
  });
}

function loadNote(index) {
  const note = notes[index];
  document.getElementById("noteTitle").value = note.title;
  document.getElementById("noteContent").value = note.content;
}

function shareNote() {
  alert("Note sharing via email or link will be integrated soon.");
}
