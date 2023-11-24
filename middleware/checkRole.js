module.exports = (roles) => {
  // console.log(roles);
  return (req, res, next) => {
    if (!req.user.userId) {
      return res.status(401).json({ status: 401, message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ status: 403, message: "Forbidden" });
    }

    next();
  };
};
