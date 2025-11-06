// server/src/models/Interview.js
const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true, trim: true, maxlength: 100 },
  role: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  package: { type: String, default: '' },
  status: { type: String, enum: ['Passed','Failed','Pending'], default: 'Pending' },
  notes: { type: String, default: '' },
  topics: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Interview', interviewSchema);
