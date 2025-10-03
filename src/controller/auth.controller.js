const User = require("../models/user.models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const createUserController = async (req, res) => {
  try {
    const { username, fullName, email, password } = req.body;
    
    // Input validation
    if (!username || !fullName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ error: "User with same username or email already exists" });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ ...req.body, password: hashedPassword });
    await newUser.save();
    
    res.status(201).json({ message: "Created new user successfully" });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Error creating a new user" });
  }
};

const loginController = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Input validation
    if ((!username && !email) || !password) {
      return res.status(400).json({ error: "Username/email and password are required" });
    }
    
    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const matchedUser = await bcrypt.compare(password, user.password);
    if (!matchedUser) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const { password: _, ...data } = user._doc;
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }).status(200).json(data);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const logoutController = async (req, res) => {
  try {
    res
      .clearCookie("token", { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' 
      })
      .status(200)
      .json({ message: "User logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const refetchUserController = async (req, res) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }
    
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
        const user = await User.findById(id).select('-password');
        if (!user) {
          return res.status(404).json({ error: "User not found" });
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
