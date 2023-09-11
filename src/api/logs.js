/* eslint-disable no-underscore-dangle */
const { Router } = require('express');

const LogEntry = require('../models/LogEntry');
const Users = require('../models/User');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const entries = await LogEntry.find();
    res.json(entries);
  } catch (error) {
    next(error);
  }
});

// Get likes
router.get('/likes', async (req, res, next) => {
  try {
    const data = {};

    const entry = await LogEntry.findOne({ _id: req.query._id });
    data.likes = entry.likes;

    const user = await Users.findOne({ _id: req.query.userId });
    if (user.likedMapEntries.includes(req.query._id)) {
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

    const updatedLogEntry = await LogEntry.findOneAndUpdate(
      { _id: filter },
      updatedLikes,
    );

    await updatedLogEntry.save();

    const user = await Users.findOne({ _id: req.query.userId });

    // check if users likedLogEntries[] contains req.query._id
    if (user.likedMapEntries.includes(req.query._id)) {
      // if yes {delete it from the array}
      const index = user.likedMapEntries.indexOf(req.query._id);
      user.likedMapEntries.splice(index, 1);
    } else if (!user.likedMapEntries.includes(req.query._id)) {
      // if no {add it to the array}
      user.likedMapEntries.push(req.query._id);
    }

    await user.save();

    res.json(user.likedMapEntries);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const logEntry = new LogEntry(req.body);
    const createdEntry = await logEntry.save();

    const user = await Users.findOne({ _id: req.body.authorId });
    // eslint-disable-next-line no-underscore-dangle
    user.logs.push(createdEntry._id);
    await user.save();

    res.json(createdEntry);
  } catch (error) {
    if (error.constructor.name === 'ValidationError') {
      res.status(422);
    }
    next(error);
  }
});

module.exports = router;
