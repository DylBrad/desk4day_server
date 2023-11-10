const { Router } = require('express');

const LogEntry = require('../models/LogEntry');

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const logEntryId = req.query.logId;
    const reviewData = req.body;

    const logEntry = await LogEntry.findById(logEntryId);

    logEntry.reviews.push(reviewData);

    const updatedLogEntry = logEntry.save();

    res.json(updatedLogEntry);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
