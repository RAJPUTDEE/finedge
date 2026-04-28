const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const config = require('../config');
const { ConflictError, ValidationError, UnauthorizedError, NotFoundError } = require('../utils/errors');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function sanitize(user) {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
}

async function register({ name, email, password, preferences }) {
  if (!name || !email || !password) {
    throw new ValidationError('name, email, and password are required');
  }
  const existing = await userModel.findByEmail(email);
  if (existing) throw new ConflictError('Email already registered');

  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash: hashPassword(password),
    preferences: preferences || { currency: 'INR' },
    createdAt: new Date().toISOString(),
  };
  await userModel.create(user);
  return sanitize(user);
}

async function login({ email, password }) {
  if (!email || !password) throw new ValidationError('email and password are required');
  const user = await userModel.findByEmail(email);
  if (!user || user.passwordHash !== hashPassword(password)) {
    throw new UnauthorizedError('Invalid credentials');
  }
  const token = jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
  return { token, user: sanitize(user) };
}

async function getById(id) {
  const user = await userModel.findById(id);
  if (!user) throw new NotFoundError('User');
  return sanitize(user);
}

async function listAll() {
  const users = await userModel.findAll();
  return users.map(sanitize);
}

module.exports = { register, login, getById, listAll };
