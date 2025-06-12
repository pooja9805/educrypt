// chatRoutes.js
const express = require("express");
const { askAI } = require("../controllers/chatController"); // Import the controller function
const router = express.Router();

// Route to handle the chatbot API request
router.post("/ask", askAI);

module.exports = router;
