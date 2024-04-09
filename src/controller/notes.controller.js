const Notes = require("../models/notes.models");

const getNotes = async(req,res)=>{
    try{
        const data = await Notes.find({});
        if(!data) throw new err("No notes found");
        res.status(200).json(data);
    }
    catch(err){
        res.status(500).json({msg:"Error fetching the data"});
    }
};

const createNotes = async (req, res) => {
  try {
    const { title, description } = req.body;
    const newNote = await Notes.create({ title, description });
    res.status(201).json(newNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error posting the data", error: err.message });
  }
};


module.exports = {createNotes , getNotes};