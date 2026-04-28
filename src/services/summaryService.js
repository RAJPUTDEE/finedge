const txModel = require('../models/transactionModel');
const cache = require('../utils/cache');
const { summarize, byCategory, monthlyTrends, filterTransactions } = require('../utils/analytics');
const { suggestSavingTips } = require('../utils/aiHelper');

async function getSummary(userId, filters = {}) {
  const cacheKey = `summary:${userId}:${JSON.stringify(filters)}`;
  const hit = cache.get(cacheKey);
  if (hit) return { ...hit, cached: true };

  const all = await txModel.findByUser(userId);
  const filtered = filterTransactions(all, filters);
  const totals = summarize(filtered);
  const categoryBreakdown = byCategory(filtered);
  const trends = monthlyTrends(filtered);
  const tips = suggestSavingTips(totals, categoryBreakdown);

  const result = {
    ...totals,
    byCategory: categoryBreakdown,
    monthlyTrends: trends,
    tips,
    cached: false,
  };
  cache.set(cacheKey, result);
  return result;
}

module.exports = { getSummary };
