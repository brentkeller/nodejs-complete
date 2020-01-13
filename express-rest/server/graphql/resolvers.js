const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const JWT_SECRET = 'reallysupersecretstring';

module.exports = {
  createUser: async function({ userInput }, req) {
    const { email, name, password } = userInput;

    const errors = [];
    if (!validator.isEmail(email)) {
      errors.push({ message: 'Email is invalid' });
    }
    if (
      validator.isEmpty(password) ||
      !validator.isLength(password, { min: 5 })
    ) {
      errors.push({ message: 'Password must be at least 5 characters' });
    }
    if (validator.isEmpty(name) || !validator.isLength(name, { min: 2 })) {
      errors.push({ message: 'Name must be at least 2 characters' });
    }
    if (errors.length > 0) {
      const error = new Error('Invalid input');
      error.data = errors;
      error.code = 422;
      throw error;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('User already exists');
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    const createdUser = await user.save();
    return {
      ...createdUser._doc,
      _id: createdUser._id.toString(),
    };
  },
  login: async function({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('Invalid email or password');
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      throw error;
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email,
      },
      JWT_SECRET,
      { expiresIn: '1hr' },
    );

    return {
      token,
      userId: user._id.toString(),
    };
  },
};
