// server/src/controllers/resume.controller.js
const fs = require('fs');
const path = require('path');
const Resume = require('../models/Resume');

const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

// ensure upload dir exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const file = req.file;
    // Save metadata to DB
    const doc = await Resume.create({
      user: req.user._id,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: '' // if using Cloudinary, set url here
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error('uploadResume error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listResumes = async (req, res) => {
  try {
    const docs = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json(docs);
  } catch (err) {
    console.error('listResumes error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await Resume.findOneAndDelete({ _id: id, user: req.user._id });
    if (!doc) return res.status(404).json({ message: 'Resume not found' });

    // delete file on disk (if stored locally)
    if (doc.filename) {
      const filePath = path.join(UPLOAD_DIR, doc.filename);
      fs.unlink(filePath, (err) => {
        if (err) console.warn('Failed to delete file:', filePath, err);
      });
    }

    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteResume error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// optional: serve resume file (protected)
exports.getResumeFile = async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await Resume.findOne({ _id: id, user: req.user._id }).lean();
    if (!doc) return res.status(404).json({ message: 'Resume not found' });
    if (doc.url) {
      // proxy redirect to cloud url
      return res.redirect(doc.url);
    }
    const filePath = path.resolve(__dirname, '../../uploads', doc.filename);
    return res.sendFile(filePath);
  } catch (err) {
    console.error('getResumeFile error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
