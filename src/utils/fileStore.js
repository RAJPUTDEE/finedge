const fs = require('fs/promises');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

const locks = new Map();

async function withLock(file, fn) {
  const prev = locks.get(file) || Promise.resolve();
  let release;
  const next = new Promise((resolve) => {
    release = resolve;
  });
  locks.set(file, prev.then(() => next));
  await prev;
  try {
    return await fn();
  } finally {
    release();
    if (locks.get(file) === next) locks.delete(file);
  }
}

async function readJson(file) {
  const fullPath = path.join(DATA_DIR, file);
  try {
    const raw = await fs.readFile(fullPath, 'utf8');
    return raw.trim() ? JSON.parse(raw) : [];
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeJson(file, data) {
  const fullPath = path.join(DATA_DIR, file);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf8');
}

async function updateJson(file, mutator) {
  return withLock(file, async () => {
    const current = await readJson(file);
    const next = await mutator(current);
    await writeJson(file, next);
    return next;
  });
}

module.exports = { readJson, writeJson, updateJson };
