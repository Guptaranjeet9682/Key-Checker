const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://Anish_Gupta:Anish_Gupta@filestore.sa21pfy.mongodb.net/?appName=FileStore";
const client = new MongoClient(uri);

function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = 'MAI-';
  for (let i = 0; i < 8; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
    if (i === 3) key += '-';
  }
  return key;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');

  try {
    await client.connect();
    const database = client.db('key_database');
    const keys = database.collection('keys');

    const newKey = generateKey();
    const currentTime = Date.now();
    const expiryTime = currentTime + (36 * 60 * 60 * 1000); // 36 hours

    const keyDocument = {
      key: newKey,
      created: currentTime,
      expiry: expiryTime,
      used: false,
      createdAt: new Date()
    };

    const result = await keys.insertOne(keyDocument);

    res.json({
      key: newKey,
      expiry: expiryTime,
      created: currentTime,
      message: "Key generated successfully. Valid for 36 hours."
    });

  } catch (error) {
    console.error('GetKey error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to generate key',
      error: error.message 
    });
  } finally {
    await client.close();
  }
};
