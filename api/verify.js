const { keysDatabase, isKeyExpired, cleanupExpiredKeys } = require('./utils/database');

function isKeyExpired(expiryDate) {
    const [day, month, year] = expiryDate.split('-').map(Number);
    const expiry = new Date(year, month - 1, day);
    const now = new Date();
    return now > expiry;
}

module.exports = (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const { key, device_id } = JSON.parse(body);
                
                if (!key || !device_id) {
                    return res.status(400).json({ 
                        error: 'Missing parameters',
                        message: 'Key and device_id are required' 
                    });
                }
                
                // Clean up expired keys first
                cleanupExpiredKeys();
                
                // Find the key
                const keyData = keysDatabase.find(k => 
                    k.key === key && k.device_id === device_id
                );
                
                if (!keyData) {
                    return res.status(404).json({ 
                        valid: false,
                        message: 'Key not found or invalid' 
                    });
                }
                
                // Check if key is expired
                if (isKeyExpired(keyData.expirydate)) {
                    return res.status(410).json({ 
                        valid: false,
                        message: 'Key has expired' 
                    });
                }
                
                // Key is valid
                res.status(200).json({
                    valid: true,
                    device_id: keyData.device_id,
                    expirydate: keyData.expirydate,
                    Allowoffline: keyData.Allowoffline,
                    message: 'Key is valid'
                });
                
            } catch (error) {
                res.status(500).json({ 
                    error: 'Internal server error',
                    message: error.message 
                });
            }
        });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
