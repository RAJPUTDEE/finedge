const express = require('express');
const summaryController = require('../controllers/summaryController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, summaryController.getSummary);

module.exports = router;
