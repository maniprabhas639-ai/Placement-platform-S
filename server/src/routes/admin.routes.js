// server/src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const adminCtrl = require('../controllers/admin.controller');

router.use(auth, isAdmin);

// list submissions
router.get('/submissions', adminCtrl.listSubmissions);
// update a submission
router.put('/submissions/:id', adminCtrl.updateSubmission);

module.exports = router;
