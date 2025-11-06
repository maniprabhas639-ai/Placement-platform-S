// server/src/models/Question.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],       // array may be empty for coding problems
  correctIndex: { type: Number, required: true },    // index into options (0-based)
  explanation: { type: String, default: '' },        // short explanation shown after quiz
  category: { type: String, enum: ['Aptitude','Coding','HR','Verbal','Technical'], required: true },
  difficulty: { type: String, enum: ['Easy','Medium','Hard'], default: 'Medium' }
}, { timestamps: true });

questionSchema.index({ category: 1, difficulty: 1 });

module.exports = mongoose.model('Question', questionSchema);
