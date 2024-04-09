const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const ConnectDB = require("./src/DataBase/notesDB");
const app = express();

app.use(express.json());
ConnectDB();

app.get("/",(req,res)=>{
    res.send("Hello there!!");
})

app.listen(3000,(req,res)=>{
    console.log("Server listening on Port 3000");
})