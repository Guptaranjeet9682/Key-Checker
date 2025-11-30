const { keysDatabase, cleanupExpiredKeys } = require('../utils/database');

module.exports = (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method === 'GET') {
        try {
            // Clean up expired keys first
            cleanupExpiredKeys();
            
            // Return all keys in the exact format requested
            res.status(200).json(keysDatabase);
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
