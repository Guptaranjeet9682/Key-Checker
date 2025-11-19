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
  
  try {
    const keysPath = path.join(process.cwd(), 'data', 'keys.json');
    const keysData = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
    
    const newKey = generateKey();
    const currentTime = new Date().getTime();
    const expiryTime = currentTime + (36 * 60 * 60 * 1000); // 36 hours
    
    keysData.keys[newKey] = {
      created: currentTime,
      expiry: expiryTime,
      used: false
    };
    
    fs.writeFileSync(keysPath, JSON.stringify(keysData, null, 2));
    
    res.json({
      key: newKey,
      expiry: expiryTime,
      created: currentTime,
      message: "Key generated successfully. Valid for 36 hours."
    });
    
  } catch (error) {
    console.error('GetKey error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to generate key' });
  }
};
