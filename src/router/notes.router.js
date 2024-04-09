const express = require("express");
const router = express.Router();
const { createNotes , getNotes } = require("../controller/notes.controller");

router.get("/", getNotes); // Route for 
router.post("/", createNotes); // Route for creating notes

module.exports = router;
