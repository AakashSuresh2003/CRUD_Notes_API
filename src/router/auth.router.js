const express = require("express");
const router = express.Router();
const User = require("../models/user.models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  createUserController,
  loginController,
  logoutController,
  refetchUserController,
} = require("../controller/auth.controller");


router.get("/", (req, res) => {
  res.status(200).json({ message: "Hello World" });
});

router.post("/register", createUserController);

router.post("/login", loginController);

router.get("/logout", logoutController);

router.get("/refetch", refetchUserController);

  

module.exports = router;
