/* eslint-disable no-underscore-dangle */
const { Router } = require('express');

const UserPost = require('../models/Post');
const Users = require('../models/User');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const posts = await UserPost.find();
    res.json(posts);
  } catch (error) {
    next(error);
  }
});

router.get('/current-users-posts', async (req, res, next) => {
  try {
    const id = req.query._id;
    console.log('ID: ', id);
    const posts = await UserPost.find({ author: id });
    res.json(posts);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const userPost = new UserPost(req.body);
    const createdEntry = await userPost.save();

    const user = await Users.findOne({ _id: req.body.author });
    // eslint-disable-next-line no-underscore-dangle
    user.posts.push(createdEntry._id);
    const updatedUser = await user.save();
    res.json(createdEntry);
  } catch (error) {
    if (error.constructor.name === 'ValidationError') {
      res.status(422);
    }
    next(error);
  }
});

// Get likes
router.get('/likes', async (req, res, next) => {
  try {
    const data = {};

    const entry = await UserPost.findOne({ _id: req.query._id });
    data.likes = entry.likes;

    const user = await Users.findOne({ _id: req.query.userId });
    if (user.likedPosts.includes(req.query._id)) {
      data.likedByUser = true;
    } else {
      data.likedByUser = false;
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});
// Update Likes
router.put('/likes', async (req, res, next) => {
  try {
    const filter = req.query._id;
    const updatedLikes = req.body;

    const updatedLogEntry = await UserPost.findOneAndUpdate(
      { _id: filter },
      updatedLikes,
    );

    await updatedLogEntry.save();

    const user = await Users.findOne({ _id: req.query.userId });

    // check if users likedLogEntries[] contains req.query._id
    if (user.likedPosts.includes(req.query._id)) {
      // if yes {delete it from the array}
      const index = user.likedPosts.indexOf(req.query._id);
      user.likedPosts.splice(index, 1);
    } else if (!user.likedPosts.includes(req.query._id)) {
      // if no {add it to the array}
      user.likedPosts.push(req.query._id);
    }

    await user.save();

    res.json(user.likedPosts);
  } catch (error) {
    next(error);
  }
});

router.delete('/', async (req, res, next) => {
  try {
    const post = req.body;
    const posts = await UserPost.findOneAndDelete(post);
    res.json(posts);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
