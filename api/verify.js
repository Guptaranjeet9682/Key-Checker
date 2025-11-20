const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://Anish_Gupta:Anish_Gupta@filestore.sa21pfy.mongodb.net/?appName=FileStore";
const client = new MongoClient(uri);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');
  
  const { pass } = req.query;
  
  if (!pass) {
    return res.status(400).json({ status: 'error', message: 'Key required' });
  }

  try {
    await client.connect();
    const database = client.db('key_database');
    const keys = database.collection('keys');

    const currentTime = Date.now();
    
    // Find the key and check expiry
    const keyData = await keys.findOne({ key: pass });
    
    if (keyData && keyData.expiry > currentTime) {
      return res.json({ 
        status: 'valid', 
        expiry: keyData.expiry,
        created: keyData.created
      });
    } else {
      // Auto-delete expired key
      if (keyData && keyData.expiry <= currentTime) {
        await keys.deleteOne({ key: pass });
      }
      return res.json({ status: 'invalid', message: 'Key expired or not found' });
    }
  } catch (error) {
    console.error('Verify error:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Server error',
      error: error.message 
    });
  } finally {
    await client.close();
  }
};
