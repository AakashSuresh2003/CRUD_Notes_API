const notesValidation = {
  title: {
    isLength: {
      options: { min: 5, max: 100 },
      errorMessage: "Title must be between 5 and 100 characters",
    },
    notEmpty: {
      errorMessage: "Title should not be empty",
    },
    trim: true,
  },
  description: {
    isLength: {
      options: { min: 5, max: 500 },
      errorMessage: "Description must be between 5 and 500 characters",
    },
    notEmpty: {
      errorMessage: "Description should not be empty",
    },
    trim: true,
  }
};

module.exports = { notesValidation };
