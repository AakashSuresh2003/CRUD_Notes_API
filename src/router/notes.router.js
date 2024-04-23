const express = require("express");
const router = express.Router();
const { notesValidation } = require("../validation/post.validation");
const { checkSchema } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");

const {
  createNotes,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
} = require("../controller/notes.controller");

router.use(authMiddleware);

router.get("/", getNotes);
router.get("/:id", getNote);
router.post("/", checkSchema(notesValidation), createNotes);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

module.exports = router;


