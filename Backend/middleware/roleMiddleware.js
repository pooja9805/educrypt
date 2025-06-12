const roleCheck = (requiredRole) => {
  return (req, res, next) => {
    if (req.user?.role === requiredRole) {
      next();
    } else {
      res.status(403).json({ message: "Access denied: Insufficient role" });
    }
  };
};

module.exports = { roleCheck };
