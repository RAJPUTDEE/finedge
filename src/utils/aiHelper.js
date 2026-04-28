const CATEGORY_KEYWORDS = {
  food: ['restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'lunch', 'dinner', 'breakfast', 'swiggy', 'zomato', 'starbucks', 'mcdonald'],
  groceries: ['grocery', 'supermarket', 'walmart', 'bigbasket', 'dmart', 'reliance fresh'],
  transport: ['uber', 'ola', 'taxi', 'metro', 'bus', 'fuel', 'petrol', 'diesel', 'cab'],
  utilities: ['electricity', 'water', 'gas bill', 'internet', 'wifi', 'broadband', 'recharge'],
  entertainment: ['netflix', 'spotify', 'movie', 'cinema', 'concert', 'prime video', 'hotstar'],
  shopping: ['amazon', 'flipkart', 'myntra', 'mall', 'clothes', 'shoes'],
  health: ['pharmacy', 'doctor', 'hospital', 'medicine', 'apollo', 'clinic'],
  rent: ['rent', 'lease'],
  salary: ['salary', 'payroll', 'paycheck'],
};

function autoCategorize(description = '') {
  const text = String(description).toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return category;
  }
  return 'other';
}

function suggestSavingTips(summary, byCat) {
  const tips = [];
  const { totalIncome, totalExpenses, balance } = summary;

  if (totalIncome === 0) {
    tips.push('Log your income transactions to get personalized savings advice.');
    return tips;
  }

  const savingsRate = (balance / totalIncome) * 100;
  if (savingsRate < 0) {
    tips.push('You are spending more than you earn. Review recurring expenses immediately.');
  } else if (savingsRate < 10) {
    tips.push(`You are saving only ${savingsRate.toFixed(1)}%. Aim for at least 20% of income.`);
  } else if (savingsRate >= 20) {
    tips.push(`Great job — you are saving ${savingsRate.toFixed(1)}% of income.`);
  }

  const sorted = Object.entries(byCat).sort(([, a], [, b]) => b - a);
  if (sorted.length > 0 && totalExpenses > 0) {
    const [topCat, topAmt] = sorted[0];
    const share = (topAmt / totalExpenses) * 100;
    if (share > 30) {
      tips.push(`${topCat} accounts for ${share.toFixed(1)}% of expenses — consider trimming it.`);
    }
  }

  return tips;
}

module.exports = { autoCategorize, suggestSavingTips };
