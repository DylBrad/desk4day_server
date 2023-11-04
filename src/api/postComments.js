/* eslint-disable no-underscore-dangle */
const { Router } = require('express');

const UserPost = require('../models/Post');
const User = require('../models/User');

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

// get all comments
router.get('/', async (req, res, next) => {
  try {
    const postId = req.query._id;
    const post = await UserPost.findOne({ _id: postId });
    const allComments = post.comments.reverse();

    if (allComments) {
      const commentsWithAuthorPics = await Promise.all(
        allComments.map(async (comment) => {
          const author = await User.findOne({ _id: comment.author });
          return {
            content: comment.content,
            authorPic: author.profile_pic,
            // add any other properties needed in the future
          };
        }),
      );
      console.log('COOMMEMEENNTTTSSS:', commentsWithAuthorPics[0].authorPic);

      res.json(commentsWithAuthorPics);
    } else {
      res.json(null);
    }
  } catch (error) {
    next(error);
  }
});

// Get most recent post to display on newsfeed
router.get('/newsfeedPost', async (req, res, next) => {
  try {
    const postId = req.query._id;
    const post = await UserPost.findOne({ _id: postId });

    const comment = post.comments[post.comments.length - 1];

    if (comment) {
      res.json(comment);
    } else {
      res.json(null);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
