const jwt = require("jsonwebtoken");
const Student = require("../models/StudentModel");
const Faculty = require("../models/FacultyModel");
const Admin = require("../models/AdminModel");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let user;
      if (decoded.role === "student") {
        user = await Student.findById(decoded.id).select("-password");
      } else if (decoded.role === "faculty") {
        user = await Faculty.findById(decoded.id).select("-password");
      } else if (decoded.role === "admin") {
        user = await Admin.findById(decoded.id).select("-password");
      }

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = {
        id: user._id,
        role: decoded.role,
        name: user.name
      };

      next();
    } catch (err) {
      return res.status(401).json({ message: "Token invalid" });
    }
  } else {
    return res.status(401).json({ message: "No token provided" });
  }
};

module.exports = { protect };
