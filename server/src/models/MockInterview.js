// server/src/models/MockInterview.js
const mongoose = require('mongoose');

const mockInterviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['HR', 'Technical'], required: true },
  questions: [{ type: String, required: true }],
  responses: [{ type: String }],
  feedback: { type: String, default: '' },
  score: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MockInterview', mockInterviewSchema);
