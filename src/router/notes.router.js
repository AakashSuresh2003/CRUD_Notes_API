const express = require("express");
const router = express.Router();
const {notesValidation} =  require("../validation/post.validation")
const { checkSchema } = require('express-validator');

const {
  createNotes,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
} = require("../controller/notes.controller");

router.get("/", getNotes); // Route for
router.get("/:id", getNote); // Route for
router.post("/", checkSchema(notesValidation), createNotes); // Route for creating notes
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

module.exports = router;
