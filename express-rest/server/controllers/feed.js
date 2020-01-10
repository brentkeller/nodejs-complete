const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
  const currentPage = +req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Post.find()
    .countDocuments()
    .then(count => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then(posts => {
      res.status(200).json({
        message: 'Posts fetched',
        posts,
        totalItems,
      });
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.postPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(`Validation failed: ${errors.array()[0].msg}`);
    error.statusCode = 422;
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

  const post = new Post({
    title,
    imageUrl,
    content,
    creator: { name: 'Brent' },
  });
  post
    .save()
    .then(result => {
      res.status(201).json({
        message: 'Post created',
        post,
      });
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Post not found');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: 'Post fetched.',
        post,
      });
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.putPost = (req, res, next) => {
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
    const error = new Error(`Validation failed: ${errors.array()[0].msg}`);
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Post not found');
        error.statusCode = 404;
        throw error;
      }
      if (imageUrl !== post.imageUrl) {
        deleteImage(post.imageUrl);
      }
      post.title = req.body.title;
      post.content = req.body.content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then(result => {
      res.status(200).json({
        message: 'Post updated.',
        post: result,
      });
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Post not found');
        error.statusCode = 404;
        throw error;
      }
      deleteImage(post.imageUrl);
      return Post.findByIdAndDelete(postId);
    })
    .then(result => {
      res.status(200).json({ message: 'Post deleted.' });
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

const deleteImage = filePath => {
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
