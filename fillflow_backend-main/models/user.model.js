const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
// Define User Schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      match: /\S+@\S+\.\S+/,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "manager",
      enum: ["admin", "manager", "employee"],
      required: true,
    },
    warehouseId: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Warehouse",
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

userSchema.pre("save", function (next) {
  const hashedPassword = bcrypt.hashSync(this.password, 11);
  this.password = hashedPassword;
  next();
});

// Create User model
const User = mongoose.model("User", userSchema);

module.exports = User;
