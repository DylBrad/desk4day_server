const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    profile_pic: String,
    bio: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    posts: [{ type: Schema.Types.ObjectId, ref: 'UserPost' }],
    logs: [{ type: Schema.Types.ObjectId, ref: 'LogEntry' }],
    likedPosts: [{ type: Schema.Types.ObjectId, ref: 'UserPost' }],
    likedMapEntries: [{ type: Schema.Types.ObjectId, ref: 'LogEntry' }],
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model('User', userSchema);

module.exports = User;
