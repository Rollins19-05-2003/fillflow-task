const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.createUser = async (req, res) => {
  const data = req.body;

  try {
    const existingEmailUser = await User.findOne({ email: data.email });
    if (existingEmailUser !== null) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered.",
      });
    }
    const newUser = await User.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      role: data.role,
      warehouseId: data.warehouseId,
    });

    return res.status(200).json({
      success: true,
      message: "SuccessFully signedup.",
      data: newUser,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.verifyUserByEmail = async (data) => {
  try {
    const userData = await User.findOne({ email: data.email });
    if (!userData) {
      return {
        success: false,
        message: "Email is not registered.",
      };
    }

    const passwordMatch = bcrypt.compareSync(data.password, userData.password);
    if (!passwordMatch) {
      return {
        success: false,
        message: "Incorrect password !",
      };
    }
    return {
      success: true,
      userData: userData,
    };
  } catch (error) {
    console.log("Error verifying user:", error);
    return {
      success: false,
      message: "Error verifying user",
    };
  }
};

exports.signin = async (req, res) => {
  try {
    const result = await this.verifyUserByEmail(req.body);
    if (result.success === false) {
      return res.status(401).json({
        success: result.success,
        message: result.message,
      });
    } else {
      const token = jwt.sign(
        { email: req.body.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "90d" }
      );
      return res.status(201).json({
        message: "user validated",
        success: true,
        token: token,
        userData: result.userData,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.verifyJwtToken = (token) => {
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return decodedToken;
  } catch (err) {
    throw new Error("Invalid token");
  }
};

exports.getUserByEmail = async (data) => {
  try {
    let userInfo = await User.findOne({
      email: data.email,
    });
    return {
      success: true,
      data: userInfo,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      error: "Error fetching user by email from the database",
    };
  }
};
