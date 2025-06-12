const express = require('express');
const router = express.Router();
const {createNote,
    getAllNotes,
    updateNote,
    deleteNote,
    createTodo,
    getAllTodos,     // ✅ MUST BE ADDED
    updateTodo,
    deleteTodo,
  } = require("../controllers/noteController");
  
// --------- Notes ---------
router.post('/', createNote);  // POST /api/notes
router.get('/:userId', getAllNotes);  // GET /api/notes/:userId
router.put('/:id', updateNote);  // PUT /api/notes/:id
router.delete('/:id', deleteNote);  // DELETE /api/notes/:id

// --------- Todos ---------
router.post('/todo', createTodo); // POST /api/notes/todo
router.get('/todo/:userId', getAllTodos); // GET /api/notes/todo/:userId
router.put('/todo/:id', updateTodo); // PUT /api/notes/todo/:id
router.delete('/todo/:id', deleteTodo); // DELETE /api/notes/todo/:id


module.exports = router;
