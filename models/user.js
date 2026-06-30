/**
 * User Model
 * Defines the structure and validation rules for user documents in MongoDB
 * Collection name: users
 */

import mongoose from "mongoose";

/**
 * User Schema Definition
 * Specifies all fields, their types, and validation rules
 */
const userSchema = new mongoose.Schema(
  {
    // User's full name
    name: {
      type: String,
      required: true, // Name is mandatory
    },
    // User's email address (must be unique to prevent duplicate accounts)
    email: {
      type: String,
      required: true, // Email is mandatory
      unique: true, // No two users can have the same email
    },
    // Hashed password (should never store plain text passwords)
    password: {
      type: String,
      required: true, // Password is mandatory
    },
    // User's country (optional field)
    country: {
      type: String,
    },
    // Token for password reset functionality
    resetPasswordToken: {
      type: String,
    },
    // Expiration time for the password reset token
    resetPasswordExpires: {
      type: Date,
    },
  },
  // Enable automatic createdAt and updatedAt timestamps
  { timestamps: true },
);

/**
 * Create and export User model
 * "Users" = collection name in MongoDB
 * This model is used to perform CRUD operations on user data
 */
const User = mongoose.model("Users", userSchema);

export default User;
