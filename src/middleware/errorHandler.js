const { AppError } = require('../utils/errors');

function notFoundHandler(req, res, next) {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  // eslint-disable-next-line no-console
  console.error('[unhandled error]', err);
  res.status(500).json({ error: 'Internal server error' });
}

module.exports = { errorHandler, notFoundHandler };
