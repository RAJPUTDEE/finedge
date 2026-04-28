const { readJson, updateJson } = require('../utils/fileStore');

const FILE = 'transactions.json';

async function findAll() {
  return readJson(FILE);
}

async function findByUser(userId) {
  const all = await readJson(FILE);
  return all.filter((t) => t.userId === userId);
}

async function findById(id) {
  const all = await readJson(FILE);
  return all.find((t) => t.id === id) || null;
}

async function create(tx) {
  await updateJson(FILE, (all) => {
    all.push(tx);
    return all;
  });
  return tx;
}

async function update(id, patch) {
  let updated = null;
  await updateJson(FILE, (all) => {
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) return all;
    all[idx] = { ...all[idx], ...patch, id: all[idx].id, updatedAt: new Date().toISOString() };
    updated = all[idx];
    return all;
  });
  return updated;
}

async function remove(id) {
  let removed = null;
  await updateJson(FILE, (all) => {
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) return all;
    removed = all[idx];
    all.splice(idx, 1);
    return all;
  });
  return removed;
}

module.exports = { findAll, findByUser, findById, create, update, remove };
