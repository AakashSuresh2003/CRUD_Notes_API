const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../../src/models/user.models');
const Notes = require('../../src/models/notes.models');

// Test data generators
const generateTestUser = (overrides = {}) => ({
  username: 'testuser123',
  fullName: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  ...overrides
});

const generateTestNote = (userId, overrides = {}) => ({
  title: 'Test Note Title',
  description: 'This is a test note description',
  user_id: userId,
  ...overrides
});

// Helper functions
const createTestUser = async (userData = {}) => {
  const userInfo = generateTestUser(userData);
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userInfo.password, salt);
  
  const user = new User({
    ...userInfo,
    password: hashedPassword
  });
  
  return await user.save();
};

const createTestNote = async (userId, noteData = {}) => {
  const noteInfo = generateTestNote(userId, noteData);
  const note = new Notes(noteInfo);
  return await note.save();
};

const generateAuthToken = (userId) => {
  return jwt.sign(
    { id: userId }, 
    process.env.JWT_SECRET || 'test_secret', 
    { expiresIn: '1h' }
  );
};

const loginUser = async (request, userData = {}) => {
  const userInfo = generateTestUser(userData);
  
  // Create user
  await createTestUser(userInfo);
  
  // Login and get token
  const response = await request
    .post('/api/user/login')
    .send({
      username: userInfo.username,
      password: userInfo.password
    });
    
  return {
    user: response.body,
    token: response.headers['set-cookie'] ? 
      response.headers['set-cookie'].find(cookie => cookie.startsWith('token=')) : null
  };
};

// Error test helpers
const testMissingField = async (request, endpoint, method, requiredFields, authToken = null) => {
  for (const field of requiredFields) {
    const testData = {};
    requiredFields.forEach(f => {
      if (f !== field) testData[f] = `test${f}`;
    });
    
    let req = request[method](endpoint).send(testData);
    
    if (authToken) {
      req = req.set('Cookie', authToken);
    }
    
    const response = await req;
    expect(response.status).toBe(400);
  }
};

const testUnauthorized = async (request, endpoint, method, data = {}) => {
  const response = await request[method](endpoint).send(data);
  expect(response.status).toBe(401);
};

module.exports = {
  generateTestUser,
  generateTestNote,
  createTestUser,
  createTestNote,
  generateAuthToken,
  loginUser,
  testMissingField,
  testUnauthorized
};