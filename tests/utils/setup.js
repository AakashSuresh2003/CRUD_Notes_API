const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  // Close any existing connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
});

// Cleanup after each test
afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    // Clear all collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
});

// Cleanup after all tests
afterAll(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      // Close database connection
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    
    // Stop MongoDB instance
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error('Error during test cleanup:', error);
  }
});

// Global test timeout
jest.setTimeout(30000);