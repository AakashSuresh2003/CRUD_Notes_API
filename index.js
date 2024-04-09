const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const ConnectDB = require("./src/DataBase/notesDB");
const Notes = require("./src/models/notes.models")
const notesRoute = require("./src/router/notes.router")
const app = express();

app.use(express.json());
ConnectDB();

app.get("/", (req, res) => {
  res.send("Hello there!!");
});


app.use("/api/v1/notes", notesRoute);
  

app.listen(3000, (req, res) => {
  console.log("Server listening on Port 3000");
});
