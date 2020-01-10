const express = require('express');
const { body } = require('express-validator');

const statusController = require('../controllers/status');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

const statusValidators = [
  body('status', 'Status should be at least 2 characters')
    .trim()
    .isLength({ min: 2 }),
];

router.get('/status', isAuth, statusController.getStatus);

router.put('/status', isAuth, statusValidators, statusController.putStatus);

module.exports = router;
