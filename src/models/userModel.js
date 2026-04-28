const { readJson, updateJson } = require('../utils/fileStore');

const FILE = 'users.json';

async function findAll() {
  return readJson(FILE);
}

async function findById(id) {
  const users = await readJson(FILE);
  return users.find((u) => u.id === id) || null;
}

async function findByEmail(email) {
  const users = await readJson(FILE);
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

async function create(user) {
  await updateJson(FILE, (users) => {
    users.push(user);
    return users;
  });
  return user;
}

module.exports = { findAll, findById, findByEmail, create };
