const { keysDatabase, cleanupExpiredKeys } = require('../utils/database');

module.exports = (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method === 'GET') {
        // Return all keys for admin
        cleanupExpiredKeys();
        res.status(200).json({
            total_keys: keysDatabase.length,
            keys: keysDatabase
        });
    } else if (req.method === 'POST') {
        // Delete expired keys
        const initialCount = keysDatabase.length;
        cleanupExpiredKeys();
        const deletedCount = initialCount - keysDatabase.length;
        
        res.status(200).json({
            message: `Deleted ${deletedCount} expired keys`,
            remaining_keys: keysDatabase.length
        });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
