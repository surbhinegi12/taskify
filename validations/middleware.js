const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.userId = decoded.userId;
    next();
  });
};

module.exports = { verifyToken };
