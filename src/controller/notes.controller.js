const Notes = require("../models/notes.models");

const getNotes = async (req, res) => {
  try {
    const data = await Notes.find({});
    if (!data) throw new err("No notes found");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching the data" });
  }
};

const getNote = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Notes.findById(id);
    if (!data) throw new err("No notes found");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching the data" });
  }
};

const createNotes = async (req, res) => {
  try {
    const { title, description } = req.body;
    const newNote = await Notes.create({ title, description });
    if (!newNote) throw new err("Error creating new notes");
    res.status(201).json(newNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error posting the data", error: err.message });
  }
};

const updateNote = async (req, res) => {
  try {
    const { title, description } = req.body;
    const { id } = req.params;
    const updatedNote = await Notes.findByIdAndUpdate(id, {
      title,
      description,
    });
    if (!updatedNote) throw new err("Unable to find the Note");
    res.status(201).json(updatedNote);
  } catch (err) {
    res.status(500).json({ msg: "Unable to update the Notes" });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Notes.findByIdAndDelete(id);
    if (!data) throw new err("Error deleting the notes");
    res.status(200).json(data);
  } catch {
    res.status(500).json({ msg: "Error deleting the Note" });
  }
};

module.exports = { createNotes, getNotes, getNote, updateNote, deleteNote };
