const { verifyAdmin } = require('./utils/database');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', async () => {
            try {
                const { username, password } = JSON.parse(body);
                
                if (verifyAdmin(username, password)) {
                    res.status(200).json({ 
                        success: true, 
                        message: 'Login successful' 
                    });
                } else {
                    res.status(401).json({ 
                        success: false, 
                        message: 'Invalid credentials' 
                    });
                }
            } catch (error) {
                res.status(500).json({ 
                    success: false, 
                    message: 'Server error: ' + error.message 
                });
            }
        });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
