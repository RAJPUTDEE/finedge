const crypto = require('crypto');
const txModel = require('../models/transactionModel');
const cache = require('../utils/cache');
const { autoCategorize } = require('../utils/aiHelper');
const { NotFoundError, ValidationError } = require('../utils/errors');

const ALLOWED_TYPES = ['income', 'expense'];

function invalidateUserCache(userId) {
  cache.invalidate((key) => key.startsWith(`summary:${userId}`));
}

async function create(userId, payload) {
  const { type, amount, category, description, date } = payload;
  if (!ALLOWED_TYPES.includes(type)) {
    throw new ValidationError(`type must be one of ${ALLOWED_TYPES.join(', ')}`);
  }
  if (typeof amount !== 'number' || amount <= 0) {
    throw new ValidationError('amount must be a positive number');
  }

  const tx = {
    id: crypto.randomUUID(),
    userId,
    type,
    amount,
    category: category || autoCategorize(description),
    description: description || '',
    date: date || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  await txModel.create(tx);
  invalidateUserCache(userId);
  return tx;
}

async function listForUser(userId, filters = {}) {
  const all = await txModel.findByUser(userId);
  const { type, category, from, to } = filters;
  return all.filter((t) => {
    if (type && t.type !== type) return false;
    if (category && t.category !== category) return false;
    if (from && new Date(t.date) < new Date(from)) return false;
    if (to && new Date(t.date) > new Date(to)) return false;
    return true;
  });
}

async function getById(userId, id) {
  const tx = await txModel.findById(id);
  if (!tx || tx.userId !== userId) throw new NotFoundError('Transaction');
  return tx;
}

async function update(userId, id, patch) {
  await getById(userId, id);
  if (patch.type && !ALLOWED_TYPES.includes(patch.type)) {
    throw new ValidationError(`type must be one of ${ALLOWED_TYPES.join(', ')}`);
  }
  if (patch.amount !== undefined && (typeof patch.amount !== 'number' || patch.amount <= 0)) {
    throw new ValidationError('amount must be a positive number');
  }
  const updated = await txModel.update(id, patch);
  invalidateUserCache(userId);
  return updated;
}

async function remove(userId, id) {
  await getById(userId, id);
  const removed = await txModel.remove(id);
  invalidateUserCache(userId);
  return removed;
}

module.exports = { create, listForUser, getById, update, remove };
