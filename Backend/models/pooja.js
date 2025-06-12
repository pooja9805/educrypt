const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userType: { type: String, enum: ["faculty", "student"], required: true },
  title: { type: String, required: true },
  tasks: [
    {
      text: { type: String, required: true },
      done: { type: Boolean, default: false },
    }
  ],
  dueDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("Todo", todoSchema);
