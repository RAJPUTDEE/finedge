const txService = require('../services/transactionService');
const asyncHandler = require('../middleware/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const tx = await txService.create(req.user.id, req.body);
  res.status(201).json(tx);
});

const list = asyncHandler(async (req, res) => {
  const { type, category, from, to } = req.query;
  const txs = await txService.listForUser(req.user.id, { type, category, from, to });
  res.json(txs);
});

const getOne = asyncHandler(async (req, res) => {
  const tx = await txService.getById(req.user.id, req.params.id);
  res.json(tx);
});

const update = asyncHandler(async (req, res) => {
  const tx = await txService.update(req.user.id, req.params.id, req.body);
  res.json(tx);
});

const remove = asyncHandler(async (req, res) => {
  await txService.remove(req.user.id, req.params.id);
  res.status(204).send();
});

module.exports = { create, list, getOne, update, remove };
