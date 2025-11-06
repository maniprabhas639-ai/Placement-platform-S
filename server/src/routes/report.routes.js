// server/src/routes/report.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const reportCtrl = require('../controllers/report.controller');

router.get('/', auth, reportCtrl.userReport);

module.exports = router;
