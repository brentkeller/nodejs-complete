const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const Post = require('../models/post');
const User = require('../models/user');

const JWT_SECRET = 'somesuperdupersecretkey';

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
  createPost: async function({ postInput }, req) {
    if (!req.isAuth) {
      const error = new Error('Not authenticated');
      error.code = 401;
      throw error;
    }

    const { title, content, imageUrl } = postInput;
    const errors = [];
    if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
      errors.push({ message: 'Title must be at least 5 characters' });
    }
    if (
      validator.isEmpty(content) ||
      !validator.isLength(content, { min: 5 })
    ) {
      errors.push({ message: 'Content must be at least 5 characters' });
    }
    if (errors.length > 0) {
      const error = new Error('Invalid input');
      error.data = errors;
      error.code = 422;
      throw error;
    }
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('Invalid user');
      error.code = 401;
      throw error;
    }

    const post = new Post({ title, content, imageUrl, creator: user });
    const createdPost = await post.save();
    // Add post to user's posts
    user.posts.push(post);
    await user.save();

    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString(),
    };
  },
  posts: async function({ page = 1 }, req) {
    if (!req.isAuth) {
      const error = new Error('Not authenticated');
      error.code = 401;
      throw error;
    }
    const postsPerPage = 2;
    const totalPosts = await Post.find().countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('creator')
      .skip((page - 1) * postsPerPage)
      .limit(postsPerPage);
    return {
      posts: posts.map(p => {
        return {
          ...p._doc,
          _id: p._id.toString(),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      }),
      totalPosts,
    };
  },
};
