const authController = require("../controllers/auth.controller");
const User = require("../models/user.model");

exports.isUserAuthenticated = async (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    return res.status(401).json({
      message: "JWT token is not provided",
      success: false,
    });
  }

  try {
    const isVerifiedToken = authController.verifyJwtToken(token);

    if (!isVerifiedToken) {
      return res.status(401).json({
        message: "JWT token is invalid",
        success: false,
      });
    }

    const userInfo = await authController.getUserByEmail({
      email: isVerifiedToken.email,
    });
    if (!userInfo) {
      return res.status(401).json({
        message: "Invalid email",
        success: false,
      });
    }
    req.user = userInfo;

    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.Error,
    });
  }
};
