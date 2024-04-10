const notesValidation = {
  title: {
    isLength: {
      options: { min: 5, max: 32 },
      errorMessage: "Title must be between 5 and 32 characters",
    },
    notEmptyString: {
      errorMessage: "Title should not be empty",
    },
  },
  description :{
    isLength: {
        options: { min: 5, max: 32 },
        errorMessage: "Title must be between 5 and 32 characters",
      },
      notEmptyString: {
        errorMessage: "Title should not be empty",
      },
  }
};

module.exports = { notesValidation };
