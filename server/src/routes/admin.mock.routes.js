// server/src/routes/admin.mock.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const ctrl = require('../controllers/adminMock.controller');

router.use(auth, isAdmin);

router.get('/', ctrl.listMocks);
router.get('/:id', ctrl.getMock);
router.put('/:id', ctrl.updateMock);

module.exports = router;
