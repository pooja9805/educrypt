const axios = require("axios");
require("dotenv").config();

exports.runCode = async (req, res) => {
  const { language, code, versionIndex = "0" } = req.body;

  try {
    const result = await axios.post("https://api.jdoodle.com/v1/execute", {
      clientId: process.env.JDOODLE_CLIENT_ID || "1e4c7991833878f31e6f50a853d6408a",
      clientSecret: process.env.JDOODLE_CLIENT_SECRET || "81d0c2647388866c247105bed6fb735bbcb403a0e9dd0188c68ba2dd869a464b",
      script: code,
      language,
      versionIndex
    });

    res.json({ output: result.data.output });
  } catch (err) {
    console.error("Compiler error:", err.message);
    res.status(500).json({ error: "Compiler execution failed" });
  }
};
