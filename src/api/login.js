const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const router = Router();

router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    console.log('USER:', user);

    if (user) {
      const passwordCheck = await bcrypt.compare(password, user.password);

      if (passwordCheck) {
        const token = jwt.sign({ userId: user._id }, 'your-secret-key', {
          expiresIn: '1d', // 1 day expiration
        });
        res.status(201).json({ token });
      } else {
        res.status(400).send({ error: 'Whoops! Password incorrect.' });
      }
    } else {
      res.status(400).send({ error: "Whoops! User does'nt exist." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Server Error' });
  }
});

module.exports = router;
