const express = require('express');
const { body } = require('express-validator');

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

const postValidators = [
  body('title', 'Title should be at least 5 characters')
    .trim()
    .isLength({ min: 5 }),
  body('content', 'Content should be at least 5 characters')
    .trim()
    .isLength({ min: 5 }),
];

router.get('/posts', isAuth, feedController.getPosts);

router.post('/post', isAuth, postValidators, feedController.postPost);

router.get('/post/:postId', isAuth, feedController.getPost);

router.put('/post/:postId', isAuth, postValidators, feedController.putPost);

router.delete(
  '/post/:postId',
  isAuth,
  postValidators,
  feedController.deletePost,
);

module.exports = router;
