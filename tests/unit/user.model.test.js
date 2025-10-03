const User = require('../../src/models/user.models');
const { generateTestUser } = require('../utils/helpers');

describe('User Model', () => {
  describe('Validation', () => {
    it('should create a valid user', async () => {
      const userData = generateTestUser();
      const user = new User(userData);
      
      await expect(user.validate()).resolves.toBeUndefined();
    });

    it('should require username', async () => {
      const userData = generateTestUser({ username: undefined });
      const user = new User(userData);
      
      await expect(user.validate()).rejects.toThrow('Username is required');
    });

    it('should require fullName', async () => {
      const userData = generateTestUser({ fullName: undefined });
      const user = new User(userData);
      
      await expect(user.validate()).rejects.toThrow('Full name is required');
    });

    it('should require email', async () => {
      const userData = generateTestUser({ email: undefined });
      const user = new User(userData);
      
      await expect(user.validate()).rejects.toThrow('Email is required');
    });

    it('should require password', async () => {
      const userData = generateTestUser({ password: undefined });
      const user = new User(userData);
      
      await expect(user.validate()).rejects.toThrow('Password is required');
    });

    it('should validate email format', async () => {
      const userData = generateTestUser({ email: 'invalid-email' });
      const user = new User(userData);
      
      await expect(user.validate()).rejects.toThrow('Please enter a valid email');
    });

    it('should enforce minimum username length', async () => {
      const userData = generateTestUser({ username: 'ab' });
      const user = new User(userData);
      
      await expect(user.validate()).rejects.toThrow('Username must be at least 3 characters long');
    });

    it('should enforce maximum username length', async () => {
      const userData = generateTestUser({ username: 'a'.repeat(31) });
      const user = new User(userData);
      
      await expect(user.validate()).rejects.toThrow('Username cannot exceed 30 characters');
    });

    it('should enforce minimum password length', async () => {
      const userData = generateTestUser({ password: '12345' });
      const user = new User(userData);
      
      await expect(user.validate()).rejects.toThrow('Password must be at least 6 characters long');
    });

    it('should trim whitespace from fields', async () => {
      const userData = generateTestUser({
        username: '  testuser  ',
        fullName: '  Test User  ',
        email: '  TEST@EXAMPLE.COM  '
      });
      const user = new User(userData);
      
      await user.validate();
      
      expect(user.username).toBe('testuser');
      expect(user.fullName).toBe('Test User');
      expect(user.email).toBe('test@example.com');
    });

    it('should convert email to lowercase', async () => {
      const userData = generateTestUser({ email: 'TEST@EXAMPLE.COM' });
      const user = new User(userData);
      
      await user.validate();
      
      expect(user.email).toBe('test@example.com');
    });
  });

  describe('Database Operations', () => {
    it('should save a valid user', async () => {
      const userData = generateTestUser();
      const user = new User(userData);
      
      const savedUser = await user.save();
      
      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it('should enforce unique username', async () => {
      const userData1 = generateTestUser();
      const userData2 = generateTestUser({ email: 'different@example.com' });
      
      const user1 = new User(userData1);
      await user1.save();
      
      const user2 = new User(userData2);
      
      let error;
      try {
        await user2.save();
      } catch (err) {
        error = err;
      }
      
      // In MongoDB Memory Server, unique constraint might not always throw error immediately
      // Check if error is defined or if user was saved with duplicate username
      if (error) {
        expect(error.code).toBe(11000); // MongoDB duplicate key error
      } else {
        // If no error, check that the duplicate wasn't actually saved
        const users = await User.find({ username: userData1.username });
        expect(users.length).toBe(1); // Should only have one user with this username
      }
    });

    it('should enforce unique email', async () => {
      const userData1 = generateTestUser();
      const userData2 = generateTestUser({ username: 'different_user' });
      
      const user1 = new User(userData1);
      await user1.save();
      
      const user2 = new User(userData2);
      
      let error;
      try {
        await user2.save();
      } catch (err) {
        error = err;
      }
      
      // In MongoDB Memory Server, unique constraint might not always throw error immediately
      // Check if error is defined or if user was saved with duplicate email
      if (error) {
        expect(error.code).toBe(11000); // MongoDB duplicate key error
      } else {
        // If no error, check that the duplicate wasn't actually saved
        const users = await User.find({ email: userData1.email });
        expect(users.length).toBe(1); // Should only have one user with this email
      }
    });
  });
});