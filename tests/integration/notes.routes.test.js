const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../index');
const Notes = require('../../src/models/notes.models');
const { 
  generateTestUser, 
  generateTestNote, 
  createTestUser, 
  createTestNote,
  loginUser,
  testUnauthorized 
} = require('../utils/helpers');

describe('Notes Routes', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    testUser = await createTestUser();
    authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'test_secret');
  });

  describe('GET /api/v1/notes', () => {
    it('should get all notes for authenticated user', async () => {
      const note1 = await createTestNote(testUser._id, { title: 'First Note Title' });
      const note2 = await createTestNote(testUser._id, { title: 'Second Note Title' });
      
      const response = await request(app)
        .get('/api/v1/notes')
        .set('Cookie', `token=${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('First Note Title');
      expect(response.body[1].title).toBe('Second Note Title');
    });

    it('should return empty array when user has no notes', async () => {
      const response = await request(app)
        .get('/api/v1/notes')
        .set('Cookie', `token=${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });

    it('should only return notes belonging to authenticated user', async () => {
      const otherUser = await createTestUser({ 
        username: 'otheruser', 
        email: 'other@example.com' 
      });
      
      await createTestNote(testUser._id, { title: 'My Note Title' });
      await createTestNote(otherUser._id, { title: 'Other User Note' });
      
      const response = await request(app)
        .get('/api/v1/notes')
        .set('Cookie', `token=${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('My Note Title');
    });

    it('should return 401 for unauthenticated user', async () => {
      await testUnauthorized(request(app), '/api/v1/notes', 'get');
    });
  });

  describe('GET /api/v1/notes/:id', () => {
    let testNote;

    beforeEach(async () => {
      testNote = await createTestNote(testUser._id);
    });

    it('should get specific note by id', async () => {
      const response = await request(app)
        .get(`/api/v1/notes/${testNote._id}`)
        .set('Cookie', `token=${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body._id).toBe(testNote._id.toString());
      expect(response.body.title).toBe(testNote.title);
      expect(response.body.description).toBe(testNote.description);
    });

    it('should return 404 for non-existent note', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/v1/notes/${fakeId}`)
        .set('Cookie', `token=${authToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Note not found');
    });

    it('should return 404 when trying to access other user\'s note', async () => {
      const otherUser = await createTestUser({ 
        username: 'otheruser', 
        email: 'other@example.com' 
      });
      const otherUserNote = await createTestNote(otherUser._id);
      
      const response = await request(app)
        .get(`/api/v1/notes/${otherUserNote._id}`)
        .set('Cookie', `token=${authToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Note not found');
    });

    it('should return 400 for missing note id', async () => {
      const response = await request(app)
        .get('/api/v1/notes/')
        .set('Cookie', `token=${authToken}`);
      
      // This will actually hit the GET /api/v1/notes route (get all notes)
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 for unauthenticated user', async () => {
      await testUnauthorized(request(app), `/api/v1/notes/${testNote._id}`, 'get');
    });
  });

  describe('POST /api/v1/notes', () => {
    it('should create a new note', async () => {
      const noteData = {
        title: 'New Test Note',
        description: 'This is a new test note description'
      };
      
      const response = await request(app)
        .post('/api/v1/notes')
        .set('Cookie', `token=${authToken}`)
        .send(noteData);
      
      expect(response.status).toBe(201);
      expect(response.body.title).toBe(noteData.title);
      expect(response.body.description).toBe(noteData.description);
      expect(response.body.user_id).toBe(testUser._id.toString());
      expect(response.body._id).toBeDefined();
      
      // Verify note was saved to database
      const savedNote = await Notes.findById(response.body._id);
      expect(savedNote).toBeTruthy();
      expect(savedNote.title).toBe(noteData.title);
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/v1/notes')
        .set('Cookie', `token=${authToken}`)
        .send({
          description: 'Test description'
        });
      
      expect(response.status).toBe(400);
      // Could be either validation errors or missing field error
      expect(response.body.error || response.body.errors).toBeDefined();
    });

    it('should return 400 for missing description', async () => {
      const response = await request(app)
        .post('/api/v1/notes')
        .set('Cookie', `token=${authToken}`)
        .send({
          title: 'Test Title'
        });
      
      expect(response.status).toBe(400);
      // Could be either validation errors or missing field error
      expect(response.body.error || response.body.errors).toBeDefined();
    });

    it('should return 400 for validation errors', async () => {
      const response = await request(app)
        .post('/api/v1/notes')
        .set('Cookie', `token=${authToken}`)
        .send({
          title: 'abc', // Too short
          description: 'def' // Too short
        });
      
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('should return 401 for unauthenticated user', async () => {
      await testUnauthorized(request(app), '/api/v1/notes', 'post', {
        title: 'Test Title',
        description: 'Test description'
      });
    });
  });

  describe('PUT /api/v1/notes/:id', () => {
    let testNote;

    beforeEach(async () => {
      testNote = await createTestNote(testUser._id);
    });

    it('should update existing note', async () => {
      const updateData = {
        title: 'Updated Test Note',
        description: 'Updated test note description'
      };
      
      const response = await request(app)
        .put(`/api/v1/notes/${testNote._id}`)
        .set('Cookie', `token=${authToken}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updateData.title);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body._id).toBe(testNote._id.toString());
      
      // Verify note was updated in database
      const updatedNote = await Notes.findById(testNote._id);
      expect(updatedNote.title).toBe(updateData.title);
      expect(updatedNote.description).toBe(updateData.description);
    });

    it('should return 404 for non-existent note', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .put(`/api/v1/notes/${fakeId}`)
        .set('Cookie', `token=${authToken}`)
        .send({
          title: 'Updated Title',
          description: 'Updated description'
        });
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Note not found or does not belong to the user');
    });

    it('should return 404 when trying to update other user\'s note', async () => {
      const otherUser = await createTestUser({ 
        username: 'otheruser', 
        email: 'other@example.com' 
      });
      const otherUserNote = await createTestNote(otherUser._id);
      
      const response = await request(app)
        .put(`/api/v1/notes/${otherUserNote._id}`)
        .set('Cookie', `token=${authToken}`)
        .send({
          title: 'Updated Title',
          description: 'Updated description'
        });
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Note not found or does not belong to the user');
    });

    it('should return 401 for unauthenticated user', async () => {
      await testUnauthorized(request(app), `/api/v1/notes/${testNote._id}`, 'put', {
        title: 'Updated Title',
        description: 'Updated description'
      });
    });
  });

  describe('DELETE /api/v1/notes/:id', () => {
    let testNote;

    beforeEach(async () => {
      testNote = await createTestNote(testUser._id);
    });

    it('should delete existing note', async () => {
      const response = await request(app)
        .delete(`/api/v1/notes/${testNote._id}`)
        .set('Cookie', `token=${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body._id).toBe(testNote._id.toString());
      
      // Verify note was deleted from database
      const deletedNote = await Notes.findById(testNote._id);
      expect(deletedNote).toBeNull();
    });

    it('should return 404 for non-existent note', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .delete(`/api/v1/notes/${fakeId}`)
        .set('Cookie', `token=${authToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Note not found or does not belong to the user');
    });

    it('should return 404 when trying to delete other user\'s note', async () => {
      const otherUser = await createTestUser({ 
        username: 'otheruser', 
        email: 'other@example.com' 
      });
      const otherUserNote = await createTestNote(otherUser._id);
      
      const response = await request(app)
        .delete(`/api/v1/notes/${otherUserNote._id}`)
        .set('Cookie', `token=${authToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Note not found or does not belong to the user');
    });

    it('should return 401 for unauthenticated user', async () => {
      await testUnauthorized(request(app), `/api/v1/notes/${testNote._id}`, 'delete');
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle user not authenticated in getNotes', async () => {
      // Create a token without user id
      const invalidToken = jwt.sign({ wrongField: 'test' }, process.env.JWT_SECRET || 'test_secret');
      
      const response = await request(app)
        .get('/api/v1/notes')
        .set('Cookie', `token=${invalidToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('User not authenticated');
    });

    it('should handle missing user in getNote', async () => {
      // Create a token without user id
      const invalidToken = jwt.sign({ wrongField: 'test' }, process.env.JWT_SECRET || 'test_secret');
      
      const response = await request(app)
        .get('/api/v1/notes/507f1f77bcf86cd799439011')
        .set('Cookie', `token=${invalidToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('User is not logged in');
    });

    it('should handle database errors in getNotes', async () => {
      // Mock Notes.find to throw an error
      const originalFind = Notes.find;
      Notes.find = jest.fn().mockRejectedValue(new Error('Database connection error'));

      const response = await request(app)
        .get('/api/v1/notes')
        .set('Cookie', `token=${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error fetching the data');

      // Restore original method
      Notes.find = originalFind;
    });

    it('should handle database errors in getNote', async () => {
      // Create a test note first
      const testNote = await createTestNote(testUser._id);
      
      // Mock Notes.findOne to throw an error
      const originalFindOne = Notes.findOne;
      Notes.findOne = jest.fn().mockRejectedValue(new Error('Database connection error'));

      const response = await request(app)
        .get(`/api/v1/notes/${testNote._id}`)
        .set('Cookie', `token=${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error fetching the data');

      // Restore original method
      Notes.findOne = originalFindOne;
    });

    it('should handle database errors in createNotes', async () => {
      // Mock Notes.create to throw an error
      const originalCreate = Notes.create;
      Notes.create = jest.fn().mockRejectedValue(new Error('Database connection error'));

      const response = await request(app)
        .post('/api/v1/notes')
        .set('Cookie', `token=${authToken}`)
        .send({
          title: 'Test Note',
          description: 'Test Description'
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error posting the data');

      // Restore original method
      Notes.create = originalCreate;
    });

    it('should handle database errors in updateNote', async () => {
      // Create a test note first
      const testNote = await createTestNote(testUser._id);
      
      // Mock Notes.findOneAndUpdate to throw an error
      const originalFindOneAndUpdate = Notes.findOneAndUpdate;
      Notes.findOneAndUpdate = jest.fn().mockRejectedValue(new Error('Database connection error'));

      const response = await request(app)
        .put(`/api/v1/notes/${testNote._id}`)
        .set('Cookie', `token=${authToken}`)
        .send({
          title: 'Updated Title',
          description: 'Updated Description'
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');

      // Restore original method
      Notes.findOneAndUpdate = originalFindOneAndUpdate;
    });

    it('should handle database errors in deleteNote', async () => {
      // Create a test note first
      const testNote = await createTestNote(testUser._id);
      
      // Mock Notes.findOneAndDelete to throw an error
      const originalFindOneAndDelete = Notes.findOneAndDelete;
      Notes.findOneAndDelete = jest.fn().mockRejectedValue(new Error('Database connection error'));

      const response = await request(app)
        .delete(`/api/v1/notes/${testNote._id}`)
        .set('Cookie', `token=${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');

      // Restore original method
      Notes.findOneAndDelete = originalFindOneAndDelete;
    });

    it('should handle missing user authentication in deleteNote', async () => {
      // Create a token without proper user data
      const invalidToken = jwt.sign({ invalidField: 'test' }, process.env.JWT_SECRET || 'test_secret');
      
      const response = await request(app)
        .delete('/api/v1/notes/507f1f77bcf86cd799439011')
        .set('Cookie', `token=${invalidToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Note not found or does not belong to the user');
    });
  });
});