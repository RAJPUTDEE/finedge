function toMonthKey(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function summarize(transactions) {
  const totals = transactions.reduce(
    (acc, t) => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') acc.income += amt;
      else if (t.type === 'expense') acc.expenses += amt;
      return acc;
    },
    { income: 0, expenses: 0 }
  );
  return {
    totalIncome: round(totals.income),
    totalExpenses: round(totals.expenses),
    balance: round(totals.income - totals.expenses),
    count: transactions.length,
  };
}

function byCategory(transactions) {
  const map = {};
  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    map[t.category] = round((map[t.category] || 0) + (Number(t.amount) || 0));
  }
  return map;
}

function monthlyTrends(transactions) {
  const map = {};
  for (const t of transactions) {
    const month = toMonthKey(t.date);
    if (!month) continue;
    if (!map[month]) map[month] = { month, income: 0, expenses: 0, balance: 0 };
    const amt = Number(t.amount) || 0;
    if (t.type === 'income') map[month].income += amt;
    else if (t.type === 'expense') map[month].expenses += amt;
  }
  return Object.values(map)
    .map((m) => ({
      ...m,
      income: round(m.income),
      expenses: round(m.expenses),
      balance: round(m.income - m.expenses),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function filterTransactions(transactions, { category, from, to, type } = {}) {
  return transactions.filter((t) => {
    if (category && t.category !== category) return false;
    if (type && t.type !== type) return false;
    if (from && new Date(t.date) < new Date(from)) return false;
    if (to && new Date(t.date) > new Date(to)) return false;
    return true;
  });
}

function round(n) {
  return Math.round(n * 100) / 100;
}

module.exports = {
  summarize,
  byCategory,
  monthlyTrends,
  filterTransactions,
  toMonthKey,
};
