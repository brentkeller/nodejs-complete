const express = require('express');
const { body } = require('express-validator');

const feedController = require('../controllers/feed');

const router = express.Router();

const postValidators = [
  body('title', 'Title should be at least 5 characters')
    .trim()
    .isLength({ min: 5 }),
  body('content', 'Content should be at least 5 characters')
    .trim()
    .isLength({ min: 5 }),
];
router.get('/posts', feedController.getPosts);

router.post('/post', postValidators, feedController.postPost);

router.get('/post/:postId', feedController.getPost);

router.put('/post/:postId', postValidators, feedController.putPost);

router.delete('/post/:postId', postValidators, feedController.deletePost);

module.exports = router;
