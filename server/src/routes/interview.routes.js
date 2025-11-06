// server/src/routes/interview.routes.js
const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interview.controller');
const auth = require('../middleware/auth');

router.use(auth); // all interview routes require auth
router.post('/', interviewController.createInterview);
router.get('/', interviewController.getInterviews);
router.get('/:id', interviewController.getInterviewById);
router.put('/:id', interviewController.updateInterview);
router.delete('/:id', interviewController.deleteInterview);

module.exports = router;
