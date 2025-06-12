const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.askAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });

    const prompt = `
You are an AI assistant helping students with code, cybersecurity, AI/ML, and study-related doubts.
Use the following styles:
- 📘 Short answers → give crisp response.
- 🧠 Coding help → return code inside triple backticks with syntax highlighting.
- 📝 Long answers → use bullet points, examples, and formatting.
- 💡 Add code comments in green using <span class="comment">.

Now answer this:
"${message}"`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    res.status(200).json({ reply });
  } catch (err) {
    console.error("AI Error:", err.message);
    res.status(500).json({ error: "Gemini AI failed to respond" });
  }
};
