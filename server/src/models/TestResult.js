// server/src/models/TestResult.js
const mongoose = require('mongoose');

const topicResultSchema = new mongoose.Schema({
  name: { type: String, required: true },
  correct: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  pct: { type: Number, default: 0 } // percent correct for this topic
}, { _id: false });

const questionSnapshotSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true },
  text: { type: String },
  options: { type: [String], default: [] },
  correctIndex: { type: Number },
  explanation: { type: String, default: '' },
  topics: { type: [String], default: [] }
}, { _id: false });

const testResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  correctAnswers: { type: Number, default: 0 },
  wrongAnswers: { type: Number, default: 0 },
  difficulty: { type: String },
  submittedAt: { type: Date, default: Date.now },

  // New fields
  submissionCode: { type: String, default: '' },
  language: { type: String, default: 'javascript' },
  status: { type: String, enum: ['pending','manual_review','auto_pass','auto_fail'], default: 'pending' },

  topicResults: { type: [topicResultSchema], default: [] },
  correctAnswersMap: { type: Map, of: Number, default: {} },

  // snapshot of questions used for this attempt (for solutions/review)
  questionsSnapshot: { type: [questionSnapshotSchema], default: [] },

  // optional wall-clock time for the attempt (string like "55:20" or seconds number)
  timeTaken: { type: String, default: '' }
});

testResultSchema.index({ user: 1, category: 1, submittedAt: -1 });

module.exports = mongoose.model('TestResult', testResultSchema);
