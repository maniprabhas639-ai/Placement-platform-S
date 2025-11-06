// server/src/routes/practice.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/practice.controller');
const practice = require('../controllers/practice.controller');

// all practice routes require auth
router.use(auth);

// GET sample questions
router.get('/questions', ctrl.getQuestions);

// POST results (grading & save)
router.post('/submit', ctrl.submitResult);

// GET user's results
router.get('/results', ctrl.getMyResults);

router.get('/results/:id', auth, practice.getResultById);

module.exports = router;
