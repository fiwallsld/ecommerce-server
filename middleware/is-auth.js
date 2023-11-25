const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = (req, res, next) => {
  let token = req.cookies?.access_token || req.cookies?.admin_token;

  const authHeader = req.get('Authorization');

  if (!authHeader && !token) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }

  const authToken = authHeader?.split(' ')[1];

  let decodedToken;

  try {
    decodedToken = jwt.verify(token || authToken, process.env.JWT_KEY);
  } catch (err) {
    console.log('Token invalid signature');
    err.statusCode = 500;
    throw err;
  }

  if (!decodedToken) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }
  // console.log("decodedToken---", decodedToken);
  req.user = {
    userId: decodedToken.userId,
    email: decodedToken.email,
    role: decodedToken.role,
    roomId: decodedToken?.roomId,
    token: token,
  };

  next();
};
