const mongoose = require('mongoose');
const Notes = require('../../src/models/notes.models');
const User = require('../../src/models/user.models');
const { generateTestNote, createTestUser } = require('../utils/helpers');

describe('Notes Model', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  describe('Validation', () => {
    it('should create a valid note', async () => {
      const noteData = generateTestNote(testUser._id);
      const note = new Notes(noteData);
      
      await expect(note.validate()).resolves.toBeUndefined();
    });

    it('should require user_id', async () => {
      const noteData = generateTestNote(null, { user_id: undefined });
      const note = new Notes(noteData);
      
      await expect(note.validate()).rejects.toThrow('User ID is required');
    });

    it('should require title', async () => {
      const noteData = generateTestNote(testUser._id, { title: undefined });
      const note = new Notes(noteData);
      
      await expect(note.validate()).rejects.toThrow('Title is required');
    });

    it('should require description', async () => {
      const noteData = generateTestNote(testUser._id, { description: undefined });
      const note = new Notes(noteData);
      
      await expect(note.validate()).rejects.toThrow('Description is required');
    });

    it('should enforce minimum title length', async () => {
      const noteData = generateTestNote(testUser._id, { title: 'abc' });
      const note = new Notes(noteData);
      
      await expect(note.validate()).rejects.toThrow('Title must be at least 5 characters long');
    });

    it('should enforce maximum title length', async () => {
      const noteData = generateTestNote(testUser._id, { title: 'a'.repeat(101) });
      const note = new Notes(noteData);
      
      await expect(note.validate()).rejects.toThrow('Title cannot exceed 100 characters');
    });

    it('should enforce minimum description length', async () => {
      const noteData = generateTestNote(testUser._id, { description: 'abc' });
      const note = new Notes(noteData);
      
      await expect(note.validate()).rejects.toThrow('Description must be at least 5 characters long');
    });

    it('should enforce maximum description length', async () => {
      const noteData = generateTestNote(testUser._id, { description: 'a'.repeat(501) });
      const note = new Notes(noteData);
      
      await expect(note.validate()).rejects.toThrow('Description cannot exceed 500 characters');
    });

    it('should trim whitespace from fields', async () => {
      const noteData = generateTestNote(testUser._id, {
        title: '  Test Note Title  ',
        description: '  Test note description  '
      });
      const note = new Notes(noteData);
      
      await note.validate();
      
      expect(note.title).toBe('Test Note Title');
      expect(note.description).toBe('Test note description');
    });

    it('should validate ObjectId format for user_id', async () => {
      const noteData = generateTestNote('invalid-id');
      const note = new Notes(noteData);
      
      await expect(note.validate()).rejects.toThrow();
    });
  });

  describe('Database Operations', () => {
    it('should save a valid note', async () => {
      const noteData = generateTestNote(testUser._id);
      const note = new Notes(noteData);
      
      const savedNote = await note.save();
      
      expect(savedNote._id).toBeDefined();
      expect(savedNote.title).toBe(noteData.title);
      expect(savedNote.description).toBe(noteData.description);
      expect(savedNote.user_id.toString()).toBe(testUser._id.toString());
      expect(savedNote.createdAt).toBeDefined();
      expect(savedNote.updatedAt).toBeDefined();
    });

    it('should populate user reference', async () => {
      const noteData = generateTestNote(testUser._id);
      const note = new Notes(noteData);
      await note.save();
      
      const populatedNote = await Notes.findById(note._id).populate('user_id');
      
      expect(populatedNote.user_id.username).toBe(testUser.username);
      expect(populatedNote.user_id.email).toBe(testUser.email);
    });

    it('should allow multiple notes for the same user', async () => {
      const noteData1 = generateTestNote(testUser._id, { title: 'First Note Title' });
      const noteData2 = generateTestNote(testUser._id, { title: 'Second Note Title' });
      
      const note1 = new Notes(noteData1);
      const note2 = new Notes(noteData2);
      
      const savedNote1 = await note1.save();
      const savedNote2 = await note2.save();
      
      expect(savedNote1._id).toBeDefined();
      expect(savedNote2._id).toBeDefined();
      expect(savedNote1._id.toString()).not.toBe(savedNote2._id.toString());
    });
  });
});