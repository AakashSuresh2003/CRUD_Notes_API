const jwt = require('jsonwebtoken');
const authMiddleware = require('../../src/middleware/authMiddleware');
const { createTestUser } = require('../utils/helpers');

describe('Auth Middleware', () => {
  let testUser;
  let req, res, next;

  beforeEach(async () => {
    testUser = await createTestUser();
    
    req = {
      cookies: {},
      user: null
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should authenticate user with valid token', async () => {
    const token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'test_secret');
    req.cookies.token = token;
    
    await authMiddleware(req, res, next);
    
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(testUser._id.toString());
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 401 for missing token', async () => {
    await authMiddleware(req, res, next);
    
    expect(req.user).toBeNull();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'User is not authorized or token is missing' });
  });

  it('should return 401 for invalid token', async () => {
    req.cookies.token = 'invalid_token';
    
    await authMiddleware(req, res, next);
    
    expect(req.user).toBeNull();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
  });

  it('should return 401 for expired token', async () => {
    const expiredToken = jwt.sign(
      { id: testUser._id }, 
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '0s' }
    );
    req.cookies.token = expiredToken;
    
    // Wait a moment to ensure token is expired
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await authMiddleware(req, res, next);
    
    expect(req.user).toBeNull();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
  });

  it('should return 401 for token with invalid signature', async () => {
    const tokenWithWrongSecret = jwt.sign({ id: testUser._id }, 'wrong_secret');
    req.cookies.token = tokenWithWrongSecret;
    
    await authMiddleware(req, res, next);
    
    expect(req.user).toBeNull();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
  });

  it('should handle malformed tokens', async () => {
    req.cookies.token = 'malformed.token.here';
    
    await authMiddleware(req, res, next);
    
    expect(req.user).toBeNull();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
  });

  it('should handle empty token', async () => {
    req.cookies.token = '';
    
    await authMiddleware(req, res, next);
    
    expect(req.user).toBeNull();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'User is not authorized or token is missing' });
  });
});