const { 
    keysDatabase, 
    generateRandomKey, 
    getExpiryDate,
    cleanupExpiredKeys 
} = require('../utils/database');

module.exports = (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method === 'GET') {
        try {
            // Extract parameters from URL
            const urlParts = req.url.split('/');
            const username = urlParts[2]; // After /getkey/
            
            // Extract device_id from query parameters
            const urlParams = new URLSearchParams(req.url.split('?')[1]);
            const deviceId = urlParams.get('device-id');
            
            if (!username || !deviceId) {
                return res.status(400).json({ 
                    error: 'Missing parameters',
                    message: 'Username and device-id are required' 
                });
            }
            
            // Clean up expired keys first
            cleanupExpiredKeys();
            
            // Check if device already has a key
            const existingKeyIndex = keysDatabase.findIndex(k => k.device_id === deviceId);
            
            if (existingKeyIndex !== -1) {
                // Update existing key
                const newKey = generateRandomKey();
                const expiryDate = getExpiryDate();
                
                keysDatabase[existingKeyIndex] = {
                    device_id: deviceId,
                    key: newKey,
                    expirydate: expiryDate,
                    Allowoffline: false,
                    username: username,
                    created_at: new Date().toISOString()
                };
                
                res.status(200).json(keysDatabase[existingKeyIndex]);
            } else {
                // Create new key
                const newKey = generateRandomKey();
                const expiryDate = getExpiryDate();
                
                const keyData = {
                    device_id: deviceId,
                    key: newKey,
                    expirydate: expiryDate,
                    Allowoffline: false,
                    username: username,
                    created_at: new Date().toISOString()
                };
                
                keysDatabase.push(keyData);
                res.status(201).json(keyData);
            }
            
        } catch (error) {
            res.status(500).json({ 
                error: 'Internal server error',
                message: error.message 
            });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
