/* eslint-disable no-underscore-dangle */
const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const User = require('../models/User');
const Token = require('../models/Token');

const sendEmail = require('../utils/sendEmail');

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

router.get('/email', async (req, res, next) => {
  try {
    const { email } = req.query;
    const users = await User.findOne({ email: email });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.get('/send-email', async (req, res, next) => {
  try {
    const { email } = req.query;
    const { id } = req.query;

    const verificationToken = await new Token({
      userId: id,
      token: crypto.randomBytes(32).toString('hex'),
    }).save();

    // POTENTIAL ISSUE: If a token  for the user id already
    // exists for some reason, the new token cannot be created.
    // Check if token already exists, and delete it before sending new verification email

    const url = `${process.env.BASE_URL}/api/users/email-verify/${id}/verify/${verificationToken.token}`;

    console.log('---->>>> URL:', url);
    await sendEmail(email, 'Verify email', url);
    // respond with the created user obj to be used as cookies in frontend
    res.json({ verificationToken });
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

// Create user and send first email verification link
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

    // Send verification email
    const verificationToken = await new Token({
      userId: createdUser._id,
      token: crypto.randomBytes(32).toString('hex'),
    }).save();
    const url = `${process.env.BASE_URL}/api/users/email-verify/${createdUser._id}/verify/${verificationToken.token}`;

    await sendEmail(createdUser.email, 'Verify email', url);
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

// Verify email when link is clicked
router.get('/email-verify/:id/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });

    if (!user) {
      return res.status(400).send({ message: 'User does not exist' });
    }

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });

    const filter = { _id: user._id };
    const update = { verified: true };

    await User.findOneAndUpdate(filter, update);

    await token.remove();

    // Read the HTML file
    const htmlPath = path.join(__dirname, '../views', 'emailVerified.html');
    let htmlContent = fs.readFileSync(htmlPath, 'utf-8');

    // Replace the placeholder with the actual URL
    const homepageUrl = process.env.CORS_ORIGIN;
    htmlContent = htmlContent.replace('__HOMEPAGE_URL__', homepageUrl);

    // Send the modified HTML content
    return res.status(200).send(htmlContent);
  } catch (error) {
    return res.status(500).send({ message: 'Server Error' });
  }
});

module.exports = router;
