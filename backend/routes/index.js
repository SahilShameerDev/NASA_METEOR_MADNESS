var express = require('express');
var router = express.Router();
const { getNeoFeed } = require('../services/nasa');

/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    const nasaData = await getNeoFeed('2025-09-01', '2025-09-07');
    res.json(nasaData);
  } catch (error) {
    console.error('Error fetching NASA data:', error);
    res.status(500).json({ error: 'Failed to fetch NASA data' });
  }
});

module.exports = router;
