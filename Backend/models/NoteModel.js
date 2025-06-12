const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userType: { type: String, enum: ["faculty", "student"], required: true },
  title: { type: String, required: true },
  content: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Note", noteSchema);
