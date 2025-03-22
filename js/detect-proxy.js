const axios = require('axios');

module.exports = async (req, res) => {
  try {
    // Get user's IP address
    const clientIP = req.headers['x-forwarded-for'] || req.ip;

    // Use your ipstack API key
    const apiKey = process.env.IPSTACK_KEY;

    // Fetch IP details
    const response = await axios.get(
      `http://api.ipstack.com/${clientIP}?access_key=${apiKey}`
    );

    // Check if proxy/VPN is detected
    const isProxy = response.data.security?.is_proxy || false;

    // Return result
    res.json({ isProxy });
  } catch (error) {
    res.status(500).json({ error: 'Detection failed' });
  }
};