const budgetService = require('../services/budgetService');
const asyncHandler = require('../middleware/asyncHandler');

const setBudget = asyncHandler(async (req, res) => {
  const budget = await budgetService.setBudget(req.user.id, req.body);
  res.status(201).json(budget);
});

const list = asyncHandler(async (req, res) => {
  const budgets = await budgetService.listForUser(req.user.id);
  res.json(budgets);
});

const getForMonth = asyncHandler(async (req, res) => {
  const budget = await budgetService.getForMonth(req.user.id, req.params.month);
  res.json(budget);
});

module.exports = { setBudget, list, getForMonth };
