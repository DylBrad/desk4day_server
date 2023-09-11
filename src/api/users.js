/* eslint-disable no-underscore-dangle */
const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const id = req.query._id;
    const users = await User.findOne({ _id: id });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.put('/', async (req, res, next) => {
  try {
    console.log(req.body);
    const filter = req.query;
    const updatePic = req.body;
    const updatedUser = await User.findOneAndUpdate(filter, updatePic);
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

router.put('/edit-profile', async (req, res, next) => {
  try {
    console.log('BODY: ', req.body);
    console.log('QUERY: ', req.query);
    const filter = req.query;
    const updates = req.body;
    const updatedUser = await User.findOneAndUpdate(filter, updates);
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const user = new User(req.body);

    console.log('body:', req.body);

    // Hash the users password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    // Check if user already exists
    const sanitisedEmail = user.email.toLowerCase();

    const existingUser = await User.findOne({ email: sanitisedEmail });
    const existingUsername = await User.findOne({ username: user.username });

    if (existingUsername) {
      return res.status(409).send('This username already exists.');
    }
    if (existingUser) {
      return res.status(409).send('This email is already in use.');
    }

    user.email = sanitisedEmail;

    // create new user
    const createdUser = await user.save();

    const token = jwt.sign(createdUser.toJSON(), sanitisedEmail, {
      expiresIn: 60 * 24,
    });

    // respond with the created user obj to be used as cookies in frontend
    res.json({ token });
  } catch (error) {
    if (error.constructor.name === 'ValidationError') {
      res.status(422);
    }
    next(error);
  }
  return 'success';
});

module.exports = router;
