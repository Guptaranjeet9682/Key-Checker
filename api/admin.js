const { keysDatabase, adminSettings, cleanupExpiredKeys } = require('./utils/database');

// Check admin authentication
function checkAdminAuth(req) {
    return adminSettings.isLoggedIn;
}

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    // Check admin authentication for all routes
    if (!checkAdminAuth(req)) {
        return res.status(401).json({ 
            error: 'Unauthorized',
            message: 'Please login to admin panel first' 
        });
    }
    
    if (req.method === 'GET') {
        // Return enhanced admin data
        const deletedCount = cleanupExpiredKeys();
        const now = new Date();
        
        const stats = {
            total_keys: keysDatabase.length,
            active_keys: keysDatabase.filter(key => !isKeyExpired(key.expirydate)).length,
            expired_keys: keysDatabase.filter(key => isKeyExpired(key.expirydate)).length,
            auto_deleted: deletedCount,
            server_time: now.toISOString()
        };
        
        res.status(200).json({
            stats: stats,
            keys: keysDatabase
        });
    } else if (req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const { action, key } = JSON.parse(body);
                
                if (action === 'delete_expired') {
                    const deletedCount = cleanupExpiredKeys();
                    res.status(200).json({
                        success: true,
                        message: `Deleted ${deletedCount} expired keys`,
                        remaining_keys: keysDatabase.length
                    });
                } else if (action === 'delete_key' && key) {
                    const initialLength = keysDatabase.length;
                    keysDatabase = keysDatabase.filter(k => k.key !== key);
                    const deleted = initialLength - keysDatabase.length;
                    
                    res.status(200).json({
                        success: true,
                        message: deleted > 0 ? 'Key deleted successfully' : 'Key not found',
                        deleted: deleted
                    });
                } else if (action === 'logout') {
                    adminSettings.isLoggedIn = false;
                    res.status(200).json({
                        success: true,
                        message: 'Logged out successfully'
                    });
                } else {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid action'
                    });
                }
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Server error'
                });
            }
        });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};

function isKeyExpired(expiryDate) {
    const [day, month, year] = expiryDate.split('-').map(Number);
    const expiry = new Date(year, month - 1, day);
    const now = new Date();
    return now > expiry;
}
