const axios = require('axios');
require('dotenv').config(); // Load environment variables

// Store token and expiry time in memory
let token = null;
let tokenExpiryTime = null;

// Function to fetch a new token
const fetchToken = async () => {
  try {
    // Make the POST request to the token generation API
    const response = await axios.post(`${process.env.EASYECOM_BASE_URL}/access/token`, {
      email: process.env.EASYECOM_EMAIL,
      password: process.env.EASYECOM_PASSWORD,
      location_key: process.env.EASYECOM_LOCATION_KEY
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Extract the token and expiry time from the response
    const { jwt_token, expires_in } = response.data.data.token;

    // Store the token and calculate the expiration time
    token = jwt_token;
    tokenExpiryTime = Date.now() + expires_in * 1000; // expires_in is in seconds
   

   
  } catch (error) {
    console.error('Error fetching token:', error.response ? error.response.data : error.message);
    throw new Error('Failed to fetch token');
  }
};

// Function to get the token (refresh if expired)
const getToken = async () => {
  if (!token || Date.now() >= tokenExpiryTime) {
    await fetchToken(); // Fetch a new token if expired or null
  }
  return token;
};

module.exports = { getToken };
