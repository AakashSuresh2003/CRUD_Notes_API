const express = require("express");
const router = express.Router();
const { createNotes , getNotes , getNote , updateNote, deleteNote} = require("../controller/notes.controller");

router.get("/", getNotes); // Route for 
router.get("/:id", getNote); // Route for 
router.post("/", createNotes); // Route for creating notes
router.put("/:id",updateNote)
router.delete("/:id",deleteNote);

module.exports = router;
