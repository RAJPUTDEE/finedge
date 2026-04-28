const express = require('express');
const budgetController = require('../controllers/budgetController');
const { requireAuth } = require('../middleware/auth');
const { validateBudget } = require('../middleware/validator');

const router = express.Router();

router.use(requireAuth);

router.post('/', validateBudget, budgetController.setBudget);
router.get('/', budgetController.list);
router.get('/:month', budgetController.getForMonth);

module.exports = router;
