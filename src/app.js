const express = require('express');
const cors = require('cors');

const logger = require('./middleware/logger');
const rateLimiter = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const summaryRoutes = require('./routes/summaryRoutes');
const budgetRoutes = require('./routes/budgetRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);
app.use(rateLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.use('/users', userRoutes);
app.use('/transactions', transactionRoutes);
app.use('/summary', summaryRoutes);
app.use('/budgets', budgetRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
