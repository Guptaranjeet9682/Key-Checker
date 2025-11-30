// SIMPLE DATABASE - No complex dependencies
let keysDatabase = [];

// ADMIN CREDENTIALS - Change these values
let adminCredentials = {
    username: "admin",      // CHANGE THIS
    password: "admin123"    // CHANGE THIS
};

// Generate random key
function generateRandomKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 8; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
}

// Calculate expiry date (72 hours from now)
function getExpiryDate() {
    const now = new Date();
    now.setHours(now.getHours() + 72);
    
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    
    return `${day}-${month}-${year}`;
}

// Check if key is expired
function isKeyExpired(expiryDate) {
    const [day, month, year] = expiryDate.split('-').map(Number);
    const expiry = new Date(year, month - 1, day);
    const now = new Date();
    return now > expiry;
}

// Remove expired keys
function cleanupExpiredKeys() {
    const initialLength = keysDatabase.length;
    keysDatabase = keysDatabase.filter(key => !isKeyExpired(key.expirydate));
    return initialLength - keysDatabase.length;
}

// Simple admin authentication
function verifyAdmin(username, password) {
    return username === adminCredentials.username && password === adminCredentials.password;
}

// Export functions
module.exports = {
    keysDatabase,
    adminCredentials,
    verifyAdmin,
    generateRandomKey,
    getExpiryDate,
    isKeyExpired,
    cleanupExpiredKeys
};
