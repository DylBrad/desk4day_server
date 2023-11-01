/* eslint-disable no-underscore-dangle */
const { Router } = require('express');

const UserPost = require('../models/Post');

const router = Router();

// Add comment to post
router.put('/', async (req, res, next) => {
  try {
    const filter = req.query.postId;
    const data = req.body;
    const post = await UserPost.findOne({ _id: filter });

    post.comments.push(data);
    const updatedPost = await post.save();

    res.json(updatedPost);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
