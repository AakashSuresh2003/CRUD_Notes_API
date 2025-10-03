const { notesValidation } = require('../../src/validation/post.validation');

describe('Post Validation', () => {
  describe('notesValidation schema', () => {
    it('should have correct validation rules for title', () => {
      expect(notesValidation.title).toBeDefined();
      expect(notesValidation.title.isLength).toBeDefined();
      expect(notesValidation.title.isLength.options.min).toBe(5);
      expect(notesValidation.title.isLength.options.max).toBe(100);
      expect(notesValidation.title.notEmpty).toBeDefined();
      expect(notesValidation.title.trim).toBe(true);
    });

    it('should have correct validation rules for description', () => {
      expect(notesValidation.description).toBeDefined();
      expect(notesValidation.description.isLength).toBeDefined();
      expect(notesValidation.description.isLength.options.min).toBe(5);
      expect(notesValidation.description.isLength.options.max).toBe(500);
      expect(notesValidation.description.notEmpty).toBeDefined();
      expect(notesValidation.description.trim).toBe(true);
    });

    it('should have proper error messages', () => {
      expect(notesValidation.title.isLength.errorMessage).toBe('Title must be between 5 and 100 characters');
      expect(notesValidation.title.notEmpty.errorMessage).toBe('Title should not be empty');
      expect(notesValidation.description.isLength.errorMessage).toBe('Description must be between 5 and 500 characters');
      expect(notesValidation.description.notEmpty.errorMessage).toBe('Description should not be empty');
    });

    it('should export notesValidation object', () => {
      expect(typeof notesValidation).toBe('object');
      expect(notesValidation).toHaveProperty('title');
      expect(notesValidation).toHaveProperty('description');
    });
  });
});