const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
  const currentPage = +req.query.page || 1;
  const perPage = 2;

  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate('creator')
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    res.status(200).json({
      message: 'Posts fetched',
      posts,
      totalItems,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.postPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(`Validation failed`);
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  if (!req.file) {
    const error = new Error('No image provided');
    error.statusCode = 422;
    throw error;
  }

  const imageUrl = req.file.path.replace('\\', '/');
  const title = req.body.title;
  const content = req.body.content;
  const userId = req.userId;
  let creator;

  const post = new Post({
    title,
    imageUrl,
    content,
    creator: userId,
  });
  try {
    await post.save();
    const user = await User.findById(userId);
    creator = user;
    user.posts.push(post);
    const savedUser = await user.save();
    res.status(201).json({
      message: 'Post created',
      post,
      creator: { _id: creator._id, name: creator.name },
    });
    return savedUser;
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
    return err;
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId).populate('creator');
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: 'Post fetched.',
      post,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.putPost = async (req, res, next) => {
  const postId = req.params.postId;
  let imageUrl = req.body.image;
  if (req.file) imageUrl = req.file.path.replace('\\', '/');
  if (!imageUrl) {
    const error = new Error('No image provided');
    error.statusCode = 422;
    throw error;
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(`Validation failed`);
    error.statusCode = 422;
    error.data = errors.array();
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not authorized');
      error.statusCode = 403;
      throw error;
    }
    if (imageUrl !== post.imageUrl) {
      deleteImage(post.imageUrl);
    }
    post.title = req.body.title;
    post.content = req.body.content;
    post.imageUrl = imageUrl;
    await post.save();
    res.status(200).json({
      message: 'Post updated.',
      post,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not authorized');
      error.statusCode = 403;
      throw error;
    }
    deleteImage(post.imageUrl);
    await Post.findByIdAndDelete(postId);
    const user = await User.findById(post.creator);
    //user.posts = users.posts.filter(p => p._id !== postId);
    user.posts.pull(postId);
    await user.save();
    res.status(200).json({ message: 'Post deleted.' });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

const deleteImage = async filePath => {
  // Get full disk path by going up a level since we're in a folder now
  filePath = path.join(__dirname, '..', filePath);
  fs.exists(filePath, exists => {
    if (exists) {
      fs.unlink(filePath, err => {
        if (err) throw err;
      });
    }
  });
};
