const fs = require('fs');
const path = require('path');

function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = 'MAI-';
  for (let i = 0; i < 8; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
    if (i === 3) key += '-';
  }
  return key;
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const keysPath = path.join(process.cwd(), 'data', 'keys.json');
    let keysData;
    
    try {
      keysData = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
    } catch (error) {
      // If file doesn't exist, create new structure
      keysData = { keys: {} };
    }
    
    const newKey = generateKey();
    const currentTime = Date.now();
    const expiryTime = currentTime + (36 * 60 * 60 * 1000); // 36 hours
    
    // Create proper key structure
    keysData.keys[newKey] = {
      created: currentTime,
      expiry: expiryTime,
      used: false
    };
    
    // Write back to file
    fs.writeFileSync(keysPath, JSON.stringify(keysData, null, 2));
    
    // Send proper response with string dates for frontend
    res.json({
      key: newKey,
      expiry: expiryTime,
      created: currentTime,
      message: "Key generated successfully. Valid for 36 hours."
    });
    
  } catch (error) {
    console.error('GetKey error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to generate key',
      error: error.message 
    });
  }
};
