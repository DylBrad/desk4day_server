const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const { notFound, errorHandler } = require('./middlewares');
require('dotenv').config();
const logs = require('./api/logs');
const logReviews = require('./api/logReviews');
const users = require('./api/users');
const login = require('./api/login');
const posts = require('./api/posts');
const postComments = require('./api/postComments');

const app = express();

// connect mongoDB
async function main() {
  await mongoose.connect(process.env.MONGO_ATLAS_URI, () => {
    console.log('We connected to mongoDb yo!');
  });
}
main().catch((err) => console.log(err));

app.use(morgan('common'));
app.use(helmet());
app.use(
  cors({
    // Only requests coming from here can reach the backend
    origin: process.env.CORS_ORIGIN,
  }),
);

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Hello World, from index.js!',
  });
});

// marker routes here
app.use('/api/logs', logs);
app.use('/api/logReviews', logReviews);

// user routes here
app.use('/api/users', users);

// login routes
app.use('/api/login', login);

// posts
app.use('/api/posts', posts);

// post comments
app.use('/api/postComments', postComments);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 1337;

app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
