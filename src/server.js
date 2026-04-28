const app = require('./app');
const config = require('./config');

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`FinEdge API listening on http://localhost:${config.port} (${config.nodeEnv})`);
});
