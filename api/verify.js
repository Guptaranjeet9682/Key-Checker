const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');
  
  const { pass } = req.query;
  
  if (!pass) {
    return res.status(400).json({ status: 'error', message: 'Key required' });
  }

  try {
    const keysPath = path.join(process.cwd(), 'data', 'keys.json');
    let keysData;
    
    try {
      keysData = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
    } catch (error) {
      return res.json({ status: 'invalid', message: 'No keys database found' });
    }
    
    const keyData = keysData.keys[pass];
    const currentTime = Date.now();
    
    if (keyData && keyData.expiry > currentTime) {
      return res.json({ 
        status: 'valid', 
        expiry: keyData.expiry,
        created: keyData.created
      });
    } else {
      return res.json({ status: 'invalid', message: 'Key expired or not found' });
    }
  } catch (error) {
    console.error('Verify error:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Server error',
      error: error.message 
    });
  }
};
