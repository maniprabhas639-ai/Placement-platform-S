// server/src/routes/mockInterview.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/mockInterview.controller');

router.use(auth);
router.post('/start', ctrl.startMock);
router.post('/submit', ctrl.submitMock);
router.get('/', ctrl.getMocks);

module.exports = router;
