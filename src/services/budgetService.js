const crypto = require('crypto');
const budgetModel = require('../models/budgetModel');
const { ValidationError, NotFoundError } = require('../utils/errors');

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

async function setBudget(userId, { month, monthlyGoal, savingsTarget }) {
  if (!month || !MONTH_RE.test(month)) {
    throw new ValidationError('month must be in YYYY-MM format');
  }
  if (typeof monthlyGoal !== 'number' || monthlyGoal < 0) {
    throw new ValidationError('monthlyGoal must be a non-negative number');
  }
  if (savingsTarget !== undefined && (typeof savingsTarget !== 'number' || savingsTarget < 0)) {
    throw new ValidationError('savingsTarget must be a non-negative number');
  }

  const budget = {
    id: crypto.randomUUID(),
    userId,
    month,
    monthlyGoal,
    savingsTarget: savingsTarget ?? 0,
    updatedAt: new Date().toISOString(),
  };
  return budgetModel.upsert(budget);
}

async function listForUser(userId) {
  return budgetModel.findByUser(userId);
}

async function getForMonth(userId, month) {
  const budget = await budgetModel.findByUserMonth(userId, month);
  if (!budget) throw new NotFoundError('Budget');
  return budget;
}

module.exports = { setBudget, listForUser, getForMonth };
