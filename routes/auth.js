const express = require('express');
const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post(
  '/login',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail()
      .trim(),
    body('password', 'Password should be at least 5 characters')
      .trim()
      .isLength({
        min: 5,
      })
      .isAlphanumeric(),
  ],
  authController.postLogin,
);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);

router.post(
  '/signup',
  [
    body('name')
      .isLength({ min: 2 })
      .withMessage('Name is required'),
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail()
      .trim()
      .custom((value, { req }) => {
        // Basic custom validation example
        // if (value === 'foo@boo.com') throw new Error('This email is banned');
        // return true;
        // Validate account doesn't already exist
        return User.findOne()
          .byEmail(value)
          .then(existingUser => {
            if (existingUser) {
              return Promise.reject(
                'An account with that email already exists.',
              );
            }
          });
      }),
    body('password', 'Password should be at least 5 characters')
      .trim()
      .isLength({
        min: 5,
      })
      .isAlphanumeric(),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password)
          throw new Error('Passwords must match');
        return true;
      }),
  ],
  authController.postSignup,
);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
