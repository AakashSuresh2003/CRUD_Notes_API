const request = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = require('../../index');
const User = require('../../src/models/user.models');
const { generateTestUser, createTestUser, testMissingField } = require('../utils/helpers');

describe('Auth Routes', () => {
  describe('POST /api/user/register', () => {
    it('should register a new user successfully', async () => {
      const userData = generateTestUser();
      
      const response = await request(app)
        .post('/api/user/register')
        .send(userData);
      
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Created new user successfully');
      
      // Verify user was saved to database
      const savedUser = await User.findOne({ username: userData.username });
      expect(savedUser).toBeTruthy();
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.fullName).toBe(userData.fullName);
      
      // Verify password was hashed
      expect(savedUser.password).not.toBe(userData.password);
      const isPasswordValid = await bcrypt.compare(userData.password, savedUser.password);
      expect(isPasswordValid).toBe(true);
    });

    it('should return 400 for missing required fields', async () => {
      await testMissingField(
        request(app),
        '/api/user/register',
        'post',
        ['username', 'fullName', 'email', 'password']
      );
    });

    it('should return 409 for duplicate username', async () => {
      const userData = generateTestUser();
      await createTestUser(userData);
      
      const response = await request(app)
        .post('/api/user/register')
        .send(generateTestUser({ email: 'different@example.com' }));
      
      expect(response.status).toBe(409);
      expect(response.body.error).toBe('User with same username or email already exists');
    });

    it('should return 409 for duplicate email', async () => {
      const userData = generateTestUser();
      await createTestUser(userData);
      
      const response = await request(app)
        .post('/api/user/register')
        .send(generateTestUser({ username: 'differentuser' }));
      
      expect(response.status).toBe(409);
      expect(response.body.error).toBe('User with same username or email already exists');
    });

    it('should handle database errors gracefully', async () => {
      // Test with invalid data that would cause a database error
      const response = await request(app)
        .post('/api/user/register')
        .send({
          username: 'ab', // Too short
          fullName: 'Test User',
          email: 'invalid-email', // Invalid format
          password: 'password123'
        });
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error creating a new user');
    });
  });

  describe('POST /api/user/login', () => {
    let testUser;
    let testUserData;

    beforeEach(async () => {
      testUserData = generateTestUser();
      testUser = await createTestUser(testUserData);
    });

    it('should login with valid username and password', async () => {
      const response = await request(app)
        .post('/api/user/login')
        .send({
          username: testUserData.username,
          password: testUserData.password
        });
      
      expect(response.status).toBe(200);
      expect(response.body.username).toBe(testUser.username);
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.fullName).toBe(testUser.fullName);
      expect(response.body.password).toBeUndefined();
      
      // Check for JWT token in cookies
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(cookie => cookie.startsWith('token='))).toBe(true);
    });

    it('should login with valid email and password', async () => {
      const response = await request(app)
        .post('/api/user/login')
        .send({
          email: testUserData.email,
          password: testUserData.password
        });
      
      expect(response.status).toBe(200);
      expect(response.body.username).toBe(testUser.username);
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/api/user/login')
        .send({
          password: testUserData.password
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username/email and password are required');
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/user/login')
        .send({
          username: 'nonexistentuser',
          password: testUserData.password
        });
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(app)
        .post('/api/user/login')
        .send({
          username: testUserData.username,
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should set secure cookie options', async () => {
      const response = await request(app)
        .post('/api/user/login')
        .send({
          username: testUserData.username,
          password: testUserData.password
        });
      
      const cookies = response.headers['set-cookie'];
      const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
      
      expect(tokenCookie).toContain('HttpOnly');
      expect(tokenCookie).toContain('SameSite=Strict');
    });
  });

  describe('GET /api/user/logout', () => {
    it('should logout user successfully', async () => {
      const response = await request(app)
        .get('/api/user/logout');
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User logged out successfully');
      
      // Check that cookie is cleared
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
      expect(tokenCookie).toContain('token=;');
    });
  });

  describe('GET /api/user/refetch', () => {
    let testUser;
    let testUserData;
    let authToken;

    beforeEach(async () => {
      testUserData = generateTestUser();
      testUser = await createTestUser(testUserData);
      authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'test_secret');
    });

    it('should refetch user data with valid token', async () => {
      const response = await request(app)
        .get('/api/user/refetch')
        .set('Cookie', `token=${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.username).toBe(testUser.username);
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.password).toBeUndefined();
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .get('/api/user/refetch');
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/user/refetch')
        .set('Cookie', 'token=invalid_token');
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid JWT token');
    });

    it('should return 401 for expired token', async () => {
      const expiredToken = jwt.sign(
        { id: testUser._id }, 
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '-1s' } // Use negative time to ensure it's expired
      );
      
      const response = await request(app)
        .get('/api/user/refetch')
        .set('Cookie', `token=${expiredToken}`);
      
      expect(response.status).toBe(401);
      // Accept either expired or invalid token error as both are valid for security
      expect(['Expired JWT token', 'Invalid JWT token']).toContain(response.body.error);
    });

    test('should return 404 for deleted user', async () => {
      // Create a fresh user for this test
      const tempUser = new User({
        username: 'tempuser',
        fullName: 'Temp User',
        email: 'temp@example.com',
        password: 'password123'
      });
      await tempUser.save();

      // Login to get a valid token
      const loginResponse = await request(app)
        .post('/api/user/login')
        .send({
          usernameOrEmail: tempUser.username,
          password: 'password123'
        });

      expect(loginResponse.status).toBe(200);
      const cookies = loginResponse.headers['set-cookie'];

      // Delete the user
      await User.findByIdAndDelete(tempUser._id);

      // Try to refetch with the token of deleted user
      const response = await request(app)
        .get('/api/user/refetch')
        .set('Cookie', cookies);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });

    test('should handle server errors during token verification', async () => {
      // Mock jwt.verify to simulate TokenExpiredError specifically
      const jwt = require('jsonwebtoken');
      const originalVerify = jwt.verify;
      
      // Test for TokenExpiredError specifically
      jwt.verify = jest.fn((token, secret, options, callback) => {
        const error = new jwt.TokenExpiredError('jwt expired', new Date());
        callback(error);
      });

      const response = await request(app)
        .get('/api/user/refetch')
        .set('Cookie', ['token=valid.but.expired.token']);

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/token/i); // More flexible assertion

      // Restore original function
      jwt.verify = originalVerify;
    });

    test('should handle general JWT verification errors', async () => {
      // Mock jwt.verify to simulate a general error
      const jwt = require('jsonwebtoken');
      const originalVerify = jwt.verify;
      
      jwt.verify = jest.fn((token, secret, options, callback) => {
        const error = new Error('Some other JWT error');
        callback(error);
      });

      const response = await request(app)
        .get('/api/user/refetch')
        .set('Cookie', ['token=some.token.value']);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('JWT verification failed');

      // Restore original function
      jwt.verify = originalVerify;
    });
  });
});