const userService = require('../services/userService');
const asyncHandler = require('../middleware/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const user = await userService.register(req.body);
  res.status(201).json(user);
});

const login = asyncHandler(async (req, res) => {
  const result = await userService.login(req.body);
  res.json(result);
});

const me = asyncHandler(async (req, res) => {
  const user = await userService.getById(req.user.id);
  res.json(user);
});

const list = asyncHandler(async (req, res) => {
  const users = await userService.listAll();
  res.json(users);
});

module.exports = { register, login, me, list };
