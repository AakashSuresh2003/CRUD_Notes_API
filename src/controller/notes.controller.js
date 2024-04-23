const Notes = require("../models/notes.models");
const { notesValidation } = require("../validation/post.validation");
const { validationResult } = require("express-validator");

const getNotes = async (req, res) => {
  try {
    const id = req.user.id;
    console.log("\nRequest ID: " + id);
    const data = await Notes.find({ user_id: id });
    if (!data) throw new err("No notes found");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching the data" });
  }
};

const getNote = async (req, res) => {
  try {
    const user_id = req.user.id;
    if (!user_id) throw new Error("User is not logged in");

    const { id } = req.params;

    const data = await Notes.findOne({ _id: id, user_id: user_id });

    if (!data) throw new err("No notes found");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching the data" });
  }
};

const createNotes = async (req, res) => {
  try {
    const id = req.user.id;
    console.log(id);
    const result = validationResult(req);
    if (!result.isEmpty()) return res.status(400).send(result.array());

    const { title, description } = req.body;
    const newNote = await Notes.create({ title, description, user_id: id });
    if (!newNote) {
      throw new Error("Error creating new notes");
    }
    res.status(201).json(newNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error posting the data", error: err.message });
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
