const { ValidationError } = require('../utils/errors');

const ALLOWED_TYPES = ['income', 'expense'];

function validateTransactionCreate(req, res, next) {
  const { type, amount, category } = req.body || {};
  if (!ALLOWED_TYPES.includes(type)) {
    return next(new ValidationError(`type must be one of ${ALLOWED_TYPES.join(', ')}`));
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return next(new ValidationError('amount must be a positive number'));
  }
  if (category !== undefined && typeof category !== 'string') {
    return next(new ValidationError('category must be a string'));
  }
  next();
}

function validateTransactionUpdate(req, res, next) {
  const { type, amount, category } = req.body || {};
  if (type !== undefined && !ALLOWED_TYPES.includes(type)) {
    return next(new ValidationError(`type must be one of ${ALLOWED_TYPES.join(', ')}`));
  }
  if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
    return next(new ValidationError('amount must be a positive number'));
  }
  if (category !== undefined && typeof category !== 'string') {
    return next(new ValidationError('category must be a string'));
  }
  next();
}

function validateUserRegister(req, res, next) {
  const { name, email, password } = req.body || {};
  if (!name || typeof name !== 'string') return next(new ValidationError('name is required'));
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return next(new ValidationError('valid email is required'));
  if (!password || typeof password !== 'string' || password.length < 6) {
    return next(new ValidationError('password must be at least 6 characters'));
  }
  next();
}

function validateBudget(req, res, next) {
  const { month, monthlyGoal } = req.body || {};
  if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return next(new ValidationError('month must be in YYYY-MM format'));
  }
  if (typeof monthlyGoal !== 'number' || monthlyGoal < 0) {
    return next(new ValidationError('monthlyGoal must be a non-negative number'));
  }
  next();
}

module.exports = {
  validateTransactionCreate,
  validateTransactionUpdate,
  validateUserRegister,
  validateBudget,
};
