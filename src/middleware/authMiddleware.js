const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ error: "User is not authorized or token is missing" });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'test_secret', (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      
      req.user = decoded; 
      next();
    });

  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
