const { validationResult } = require('express-validator');

const User = require('../models/user');

exports.getStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    res.status(200).json({
      status: user.status,
    });
    return;
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
    return err;
  }
};

exports.putStatus = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(`Validation failed`);
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const status = req.body.status;
  try {
    const user = await User.findById(req.userId);
    user.status = status;
    await user.save();
    res.status(200).json({
      status,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};
