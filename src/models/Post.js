const mongoose = require('mongoose');

const userPostSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: true,
    },
    author: String,
    likes: {
      type: Number,
      min: 0,
      default: 0,
    },
    comments: [{ author: String, content: String }],
  },
  {
    timestamps: true,
  },
);

const UserPost = mongoose.model('UserPost', userPostSchema);

module.exports = UserPost;
