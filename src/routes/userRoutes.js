const express = require('express');
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');
const { validateUserRegister } = require('../middleware/validator');

const router = express.Router();

router.post('/', validateUserRegister, userController.register);
router.post('/login', userController.login);
router.get('/me', requireAuth, userController.me);
router.get('/', requireAuth, userController.list);

module.exports = router;
