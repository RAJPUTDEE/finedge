const fs = require('fs/promises');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

async function resetData() {
  for (const file of ['users.json', 'transactions.json', 'budgets.json']) {
    await fs.writeFile(path.join(DATA_DIR, file), '[]', 'utf8');
  }
}

module.exports = { resetData };
