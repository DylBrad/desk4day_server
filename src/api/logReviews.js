const { Router } = require('express');

const LogEntry = require('../models/LogEntry');
const User = require('../models/User');

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const logEntryId = req.query.logId;
    const reviewData = req.body;

    const logEntry = await LogEntry.findById(logEntryId);

    logEntry.reviews.push(reviewData);

    console.log('------->>>>>>>', logEntry);

    const updatedLogEntry = logEntry.save();

    res.json(updatedLogEntry);
  } catch (error) {
    next(error);
  }
});

// get all reviews
router.get('/', async (req, res, next) => {
  try {
    const logEntryId = req.query.logId;
    const logEntry = await LogEntry.findById(logEntryId);

    if (logEntry.reviews.length > 0) {
      const orderedReviews = logEntry.reviews.reverse();
      const reviewData = await Promise.all(
        orderedReviews.map(async (review) => {
          const author = await User.findOne({ _id: review.reviewAuthor });
          return {
            content: review.reviewContent,
            image: review.reviewImage,
            authorImage: author.profile_pic,
            rating: review.reviewRating,
          };
        }),
      );
      res.json(reviewData);
    } else {
      res.json('NO REVIEWS');
    }
  } catch (error) {
    next(error);
  }
});

// get images to diplay in gallery
router.get('/review-images', async (req, res, next) => {
  try {
    const logEntryId = req.query.logId;
    const logEntry = await LogEntry.findById(logEntryId);

    const locationImages = [logEntry.image];

    if (logEntry.reviews.length > 0) {
      const orderedReviews = logEntry.reviews.reverse();

      await Promise.all(
        orderedReviews.map(async (review) => {
          locationImages.push(review.reviewImage);
        }),
      );
    }
    console.log('------------->>>>>>>>>>', locationImages);
    res.json(locationImages);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
