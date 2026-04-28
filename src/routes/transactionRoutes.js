const express = require('express');
const txController = require('../controllers/transactionController');
const { requireAuth } = require('../middleware/auth');
const { validateTransactionCreate, validateTransactionUpdate } = require('../middleware/validator');

const router = express.Router();

router.use(requireAuth);

router.post('/', validateTransactionCreate, txController.create);
router.get('/', txController.list);
router.get('/:id', txController.getOne);
router.patch('/:id', validateTransactionUpdate, txController.update);
router.delete('/:id', txController.remove);

module.exports = router;
