const { 
    keysDatabase, 
    generateRandomKey, 
    getExpiryDate,
    cleanupExpiredKeys 
} = require('./utils/database');

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method === 'GET') {
        try {
            // FIXED: Better URL parsing
            const urlPath = req.url;
            console.log('Request URL:', urlPath); // Debug log
            
            // Extract username and device-id from URL pattern: /getkey/username/device-id=value
            const parts = urlPath.split('/');
            console.log('URL Parts:', parts); // Debug log
            
            if (parts.length < 3) {
                return res.status(400).json({ 
                    error: 'Invalid URL format',
                    message: 'Use format: /getkey/username/device-id=your_device_id' 
                });
            }
            
            const username = parts[2];
            let deviceId = null;
            
            // Extract device-id from the last part
            const lastPart = parts[parts.length - 1];
            if (lastPart.includes('device-id=')) {
                deviceId = lastPart.split('device-id=')[1];
            }
            
            // Also check query parameters as fallback
            if (!deviceId) {
                const urlParams = new URLSearchParams(urlPath.split('?')[1]);
                deviceId = urlParams.get('device-id');
            }
            
            if (!username || !deviceId) {
                return res.status(400).json({ 
                    error: 'Missing parameters',
                    message: 'Username and device-id are required. Format: /getkey/username/device-id=your_device' 
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
            console.error('Error in getkey:', error);
            res.status(500).json({ 
                error: 'Internal server error',
                message: error.message 
            });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
