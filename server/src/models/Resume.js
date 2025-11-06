// server/src/models/Resume.js
const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },       // stored filename on disk
  originalName: { type: String, required: true },   // original uploaded name
  mimeType: { type: String },
  size: { type: Number },
  url: { type: String }, // optional if you use Cloudinary
  createdAt: { type: Date, default: Date.now }
});

resumeSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema);
