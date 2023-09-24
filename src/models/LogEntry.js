const mongoose = require('mongoose');

const requiredNumber = {
  type: Number,
  required: true,
};

const logEntrySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    comments: [],
    image: String,
    authorId: {
      type: String,
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    latitude: {
      ...requiredNumber,
      min: -90,
      max: 90,
    },
    longitude: {
      ...requiredNumber,
      min: -180,
      max: 180,
    },
    likes: {
      type: Number,
      min: 0,
      default: 0,
    },
    establishment: String,
  },
  {
    timestamps: true,
  },
);

// module.exports = mongoose.model('LogEntry', logEntrySchema);
const LogEntry = mongoose.model('LogEntry', logEntrySchema);

module.exports = LogEntry;
