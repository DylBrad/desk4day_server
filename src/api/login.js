const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const router = Router();

router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    const passwordCheck = await bcrypt.compare(password, user.password);

    if (user && passwordCheck) {
      const token = jwt.sign(user.toJSON(), email, {
        expiresIn: 60 * 24,
      });
      // eslint-disable-next-line no-underscore-dangle
      res.status(201).json({ token });
    }
    res.status(400).send('Whoops! Login details incorrect.');
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
