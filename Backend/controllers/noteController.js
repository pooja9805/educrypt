const Note = require("../models/NoteModel");
const Todo = require("../models/pooja");
// --------- NOTES ---------
exports.createNote = async (req, res) => {
  try {
    const { userId, userType, title, content } = req.body;
    const note = await Note.create({ userId, userType, title, content });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: "Error creating note", details: err.message });
  }
};

exports.getAllNotes = async (req, res) => {
  const { userId } = req.params;
  const userType = req.headers["x-usertype"];
  try {
    const notes = await Note.find({ userId, userType });
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notes", error: err.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Note.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error updating note", details: err.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    await Note.findByIdAndDelete(id);
    res.status(200).json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting note", details: err.message });
  }
};

// --------- TODOS ---------
exports.createTodo = async (req, res) => {
  try {
    const { userId, userType, title, tasks } = req.body;

    console.log("🚀 Incoming To-Do payload:", { userId, userType, title, tasks });

    if (!userId || !userType || !title || !Array.isArray(tasks)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const todo = new Todo({ userId, userType, title, tasks, dueDate: new Date() });
    await todo.save();

    console.log("✅ Saved To-Do:", todo);
    res.status(201).json({ message: "Created", todo });
  } catch (err) {
    console.error("❌ Error in createTodo:", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// Update Todo
exports.updateTodo = async (req, res) => {
  try {
    const { title, tasks } = req.body;

    const updated = await Todo.findByIdAndUpdate(
      req.params.id,
      { title, tasks },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Todo not found" });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update todo", error: err.message });
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: "Todo deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete todo" });
  }
};

// ✅ GET All Todos by User ID and Type
exports.getAllTodos = async (req, res) => {
  try {
    const { userId } = req.params;
    const userType = req.headers["x-usertype"];

    if (!userId || !userType) {
      return res.status(400).json({ message: "Missing userId or userType" });
    }

    const todos = await Todo.find({ userId, userType }).sort({ createdAt: -1 });
    res.status(200).json(todos);
  } catch (err) {
    console.error("❌ Error fetching todos:", err.message);
    res.status(500).json({ message: "Failed to fetch todos", error: err.message });
  }
};
