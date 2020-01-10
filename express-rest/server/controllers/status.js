const { validationResult } = require('express-validator');

const User = require('../models/user');

exports.getStatus = (req, res, next) => {
  User.findById(req.userId)
    .then(user => {
      res.status(200).json({
        status: user.status,
      });
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.putStatus = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(`Validation failed`);
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const status = req.body.status;
  User.findById(req.userId)
    .then(user => {
      user.status = status;
      return user.save();
    })
    .then(_result => {
      res.status(200).json({
        status,
      });
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};
