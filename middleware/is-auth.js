const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;

  try {
    // console.log("Confirm Token");
    decodedToken = jwt.verify(token, "frankfullstack");
  } catch (err) {
    console.log("Token invalid signature");
    err.statusCode = 500;
    throw err;
  }

  if (!decodedToken) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }

  // console.log("decodedToken---", decodedToken);

  req.user = {
    userId: decodedToken.userId,
    email: decodedToken.email,
    role: decodedToken.role,
    roomId: decodedToken?.roomId,
  };

  next();
};
