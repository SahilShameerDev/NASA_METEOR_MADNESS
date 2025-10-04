var express = require('express');
var router = express.Router();
const { getNeoFeed } = require('../services/nasa');
const { processNASAFeedData } = require('../services/calculate_hit');

/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    // Get date range from query params or use defaults
    const startDate = req.query.start_date || '2025-09-01';
    const endDate = req.query.end_date || '2025-09-07';
    
    // Fetch NASA NEO data
    const nasaData = await getNeoFeed(startDate, endDate);
    
    // Process the data with impact calculations
    const processedData = processNASAFeedData(nasaData);
    
    res.json(processedData);
  } catch (error) {
    console.error('Error fetching NASA data:', error);
    res.status(500).json({ error: 'Failed to fetch NASA data', details: error.message });
  }
});

router.get('/custom-hit', customHitHandler.getCustomHit);

module.exports = router;
