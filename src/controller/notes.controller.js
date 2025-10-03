const Notes = require("../models/notes.models");
const { notesValidation } = require("../validation/post.validation");
const { validationResult } = require("express-validator");

const getNotes = async (req, res) => {
  try {
    const id = req.user.id;
    
    if (!id) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    
    const data = await Notes.find({ user_id: id });
    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ error: "Error fetching the data" });
  }
};

const getNote = async (req, res) => {
  try {
    const user_id = req.user.id;
    if (!user_id) {
      return res.status(401).json({ error: "User is not logged in" });
    }

    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: "Note ID is required" });
    }

    const data = await Notes.findOne({ _id: id, user_id: user_id });

    if (!data) {
      return res.status(404).json({ error: "Note not found" });
    }
    
    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching note:", err);
    res.status(500).json({ error: "Error fetching the data" });
  }
};

const createNotes = async (req, res) => {
  try {
    const id = req.user.id;
    
    if (!id) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }
    
    const newNote = await Notes.create({ title, description, user_id: id });
    
    if (!newNote) {
      return res.status(500).json({ error: "Error creating new note" });
    }
    
    res.status(201).json(newNote);
  } catch (err) {
    console.error("Error creating note:", err);
    res.status(500).json({ error: "Error posting the data", details: err.message });
  }
};

const updateNote = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;
    const { id } = req.params;

    const updatedNote = await Notes.findOneAndUpdate(
      { _id: id, user_id: userId },
      { title, description },
      { new: true }
    );
    if (!updatedNote) {
      return res
        .status(404)
        .json({ error: "Note not found or does not belong to the user" });
    }

    res.status(200).json(updatedNote);
  } catch (err) {
    console.error("Error updating note:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const note = await Notes.findOne({ _id: id, user_id: userId });

    if (!note) {
      return res
        .status(404)
        .json({ error: "Note not found or does not belong to the user" });
    }

    const deletedNote = await Notes.findByIdAndDelete(id);

    if (!deletedNote) {
      return res
        .status(404)
        .json({ error: "Note not found or does not belong to the user" });
    }
    res.status(200).json(deletedNote);
  } catch (error) {
    console.error("Error deleting note:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { createNotes, getNotes, getNote, updateNote, deleteNote };
