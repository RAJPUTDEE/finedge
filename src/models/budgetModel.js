const { readJson, updateJson } = require('../utils/fileStore');

const FILE = 'budgets.json';

async function findAll() {
  return readJson(FILE);
}

async function findByUser(userId) {
  const all = await readJson(FILE);
  return all.filter((b) => b.userId === userId);
}

async function findById(id) {
  const all = await readJson(FILE);
  return all.find((b) => b.id === id) || null;
}

async function findByUserMonth(userId, month) {
  const all = await readJson(FILE);
  return all.find((b) => b.userId === userId && b.month === month) || null;
}

async function upsert(budget) {
  let saved = null;
  await updateJson(FILE, (all) => {
    const idx = all.findIndex(
      (b) => b.userId === budget.userId && b.month === budget.month
    );
    if (idx === -1) {
      all.push(budget);
      saved = budget;
    } else {
      all[idx] = { ...all[idx], ...budget, id: all[idx].id };
      saved = all[idx];
    }
    return all;
  });
  return saved;
}

module.exports = { findAll, findByUser, findById, findByUserMonth, upsert };
