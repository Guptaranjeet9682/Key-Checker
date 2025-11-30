// Advanced in-memory database with admin security
let keysDatabase = [];
let adminSettings = {
    username: "admin",
    password: "$2a$10$8K1p/a0dRT1C9.2F6dQwEe6dQdQdQdQdQdQdQdQdQdQdQdQdQdQ", // password: admin123
    isLoggedIn: false
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

// Export functions
module.exports = {
    keysDatabase,
    adminSettings,
    generateRandomKey,
    getExpiryDate,
    isKeyExpired,
    cleanupExpiredKeys
};
