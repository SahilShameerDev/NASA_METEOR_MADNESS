const axios = require('axios');

const NASA_API_KEY = 'Aws2id8N4lIlkqJ5wf135gCEcynNgH1Ky8J7wmD2';

const nasaApi = axios.create({
  baseURL: 'https://api.nasa.gov',
  timeout: 30000  // Increased to 30 seconds
});

async function getApod(params = {}) {
  const res = await nasaApi.get('/planetary/apod', { 
    params: {
      api_key: NASA_API_KEY,
      ...params
    }
  });
  console.log('Axios Response:', res);
  console.log('Response Data:', res.data);
  return res.data;
}

async function getNeoFeed(startDate, endDate) {
  const res = await nasaApi.get('/neo/rest/v1/feed', {
    params: {
      start_date: startDate,
      end_date: endDate,
      api_key: NASA_API_KEY
    }
  });
  console.log('Axios Response:', res);
  console.log('Response Data:', res.data);
  return res.data;
}

module.exports = { getApod, getNeoFeed };