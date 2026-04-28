const summaryService = require('../services/summaryService');
const asyncHandler = require('../middleware/asyncHandler');

const getSummary = asyncHandler(async (req, res) => {
  const { from, to, category } = req.query;
  const summary = await summaryService.getSummary(req.user.id, { from, to, category });
  res.json(summary);
});

module.exports = { getSummary };
