const User = require("../models/user.models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const createUserController = async (req, res) => {
  try {
    const { username, fullName, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser)
      throw new Error("User with same username Or Email Exists");
    const salt = await bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hashSync(password, salt);
    const newUser = new User({ ...req.body, password: hashedPassword });
    const savedUser = newUser.save();
    res.status(200).json({ Message: "Created new User" });
  } catch (err) {
    res.status(500).json("Error creating a new user");
  }
};

const loginController = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) throw new Error("User Not Found");
    const matchedUser = await bcrypt.compareSync(password, user.password);
    if (!matchedUser) throw new Error("UnAuthorised User");
    const { password: _, ...data } = user._doc;
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.cookie("token", token).status(200).json(data);
    console.log(req.headers);
  } catch (err) {
    res.status(500).json("Internal Server Error");
  }
};

const logoutController = async (req, res) => {
  try {
    res
      .clearCookie("token", { sameSite: true, secure: true })
      .status(200)
      .json("User logged out successfully");
  } catch (err) {
    res.status(500).json("Internal Server Error");
  }
};

const refetchUserController = async (req, res) => {
  try {
    const token = req.cookies.token;
    console.log(token);
    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, data) => {
      if (err) {
        console.error("JWT Verification Error:", err.message);
        if (err instanceof jwt.JsonWebTokenError) {
          return res.status(401).json({ error: "Invalid JWT token" });
        } else if (err instanceof jwt.TokenExpiredError) {
          return res.status(401).json({ error: "Expired JWT token" });
        } else {
          return res.status(500).json({ error: "JWT verification failed" });
        }
      }
      try {
        const id = data.id;
        console.log(id);
        const user = await User.findById(id);
        if (!user) {
          return res.status(401).json({ error: "User not logged in" });
        }
        res.status(200).json(user);
      } catch (err) {
        console.error("User Retrieval Error:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
  } catch (err) {
    console.error("Exception:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createUserController,
  loginController,
  logoutController,
  refetchUserController,
};
