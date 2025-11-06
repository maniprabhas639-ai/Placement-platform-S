// server/src/routes/resume.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const resumeCtrl = require('../controllers/resume.controller');

// configure multer disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    // unique filename: timestamp-userid-original
    const ext = path.extname(file.originalname);
    const base = `${Date.now()}-${req.user._id}`;
    cb(null, base + ext);
  }
});

// allow only pdf/doc/docx (for safety)
function fileFilter(req, file, cb) {
  const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Only PDF/DOC/DOCX allowed'));
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

// all resume routes require auth
router.use(auth);

router.post('/', upload.single('resume'), resumeCtrl.uploadResume);
router.get('/', resumeCtrl.listResumes);
router.get('/:id/file', resumeCtrl.getResumeFile); // returns file (protected)
router.delete('/:id', resumeCtrl.deleteResume);

module.exports = router;
