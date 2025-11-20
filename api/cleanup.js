const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://Anish_Gupta:Anish_Gupta@filestore.sa21pfy.mongodb.net/?appName=FileStore";
const client = new MongoClient(uri);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    await client.connect();
    const database = client.db('key_database');
    const keys = database.collection('keys');

    const currentTime = Date.now();
    
    // Delete all expired keys
    const result = await keys.deleteMany({ expiry: { $lt: currentTime } });
    
    res.json({
      status: 'success',
      message: `Deleted ${result.deletedCount} expired keys`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Cleanup failed',
      error: error.message 
    });
  } finally {
    await client.close();
  }
};
