const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();
const { protect } = require("../middleware/authMiddleware");

// ✅ Serve available languages dynamically
router.get("/languages", (req, res) => {
  res.json({
    languages: [
      { id: "python3", name: "Python 3" },
      { id: "cpp17", name: "C++ 17" },
      { id: "java", name: "Java" },
      { id: "javascript", name: "JavaScript" }
    ]
  });
});

// ✅ Compiler run endpoint
router.post("/run", protect, async (req, res) => {
  const { code, language, versionIndex = "0" } = req.body;

  try {
    const response = await axios.post("https://api.jdoodle.com/v1/execute", {
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
      script: code,
      language,
      versionIndex
    });

    res.json({ output: response.data.output });
  } catch (error) {
    console.error("Compiler error:", error.message);
    res.status(500).json({ error: "Compiler API failed" });
  }
});

module.exports = router;
