const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          res.status(401);
          throw new Error("User is unauthorized");
        }
        req.user = decoded; 
        next();
      });
    } else {
      res.status(401);
      throw new Error("User is not authorized or token is missing");
    }

  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
