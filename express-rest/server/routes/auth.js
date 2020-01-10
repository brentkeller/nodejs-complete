const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

const signupValidators = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email required')
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then(userDoc => {
        if (userDoc) return Promise.reject('Email address already exists');
      });
    })
    .normalizeEmail(),
  body('name', 'Name is required')
    .trim()
    .notEmpty(),
  body('password', 'Password should be at least 5 characters')
    .trim()
    .isLength({ min: 5 }),
];

router.put('/signup', signupValidators, authController.signup);

router.post('/login', authController.login);

module.exports = router;
