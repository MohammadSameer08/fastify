/**
 * Authentication Controller
 * Handles user registration, login, and password reset functionality
 * Never store plain text passwords - always hash them with bcrypt
 */

import User from "../models/user.js";
import crypto from "crypto"; // For generating random tokens
import bcrypt from "bcryptjs"; // For hashing passwords securely
import jwt from "jsonwebtoken"; // For creating authentication tokens

/**
 * Register User Endpoint
 * POST /register
 *
 * @param {object} request - Fastify request object containing request.body
 * @param {object} reply - Fastify reply object for sending responses
 *
 * Request body should contain:
 * - name: string (user's full name)
 * - email: string (user's email address)
 * - password: string (user's password - will be hashed)
 * - country: string (optional - user's country)
 *
 * Returns:
 * - 201: User registered successfully
 * - 400: Missing required fields or user already exists
 * - 500: Server error during registration
 */
export const registerUser = async (request, reply) => {
  try {
    // Extract user data from request body
    // Extract user data from request body
    const { name, email, password, country } = request.body;

    // Validate that all required fields are provided
    if (!name || !email || !password) {
      return reply
        .status(400)
        .send({ error: "Name, email, and password are required" });
    }

    // Check if user with this email already exists
    // This prevents duplicate accounts with the same email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return reply.status(400).send({ error: "User already exists" });
    }

    /**
     * Hash the password using bcrypt
     * Second parameter (10) is the salt rounds - higher = more secure but slower
     * Never store plain text passwords in database!
     */
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user document with hashed password
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      country,
    });

    // Save user to MongoDB database
    await newUser.save();

    // Send success response with 201 (Created) status
    reply
      .status(201)
      .send({ message: "User registered successfully", user: newUser });
  } catch (err) {
    // Log any errors that occur during registration
    request.log.error("Error registering user:", err);
    // Send error response to client
    reply.status(500).send({ error: "Error registering user" });
  }
};

/**
 * Login User Endpoint
 * POST /login
 *
 * Authenticates a user with email and password
 * Returns a JWT token for authenticated requests
 *
 * Request body should contain:
 * - email: string (user's email address)
 * - password: string (user's password in plain text)
 *
 * Returns:
 * - 200: Login successful with JWT token
 * - 400: Missing fields or invalid credentials
 * - 500: Server error during login
 */
export const loginUser = async (request, reply) => {
  try {
    // Extract email and password from request
    const { email, password } = request.body;

    // Validate required fields
    if (!email || !password) {
      return reply
        .status(400)
        .send({ error: "Email and password are required" });
    }

    // Find user in database by email
    const user = await User.findOne({ email });
    if (!user) {
      // Use generic error message for security (don't reveal if user exists)
      return reply.status(400).send({ error: "Invalid email or password" });
    }

    /**
     * Verify password by comparing plain text input with hashed password
     * bcrypt.compare() returns true if passwords match, false otherwise
     * This is secure because we're not storing plain text passwords
     */
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Use generic error message for security
      return reply.status(400).send({ error: "Invalid email or password" });
    }

    /**
     * Create JWT token for session management
     * Token contains user ID and expires after 1 hour
     * JWT_SECRET should be stored in .env file
     * Client includes token in Authorization header for protected routes
     */
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send success response with authentication token
    reply.send({ message: "Login successful", token });
  } catch (err) {
    // Log error and send generic error response
    request.log.error("Error logging in user:", err);
    reply.status(500).send({ error: "Error logging in user" });
  }
};

/**
 * Forgot Password Endpoint
 * POST /forgot-password
 *
 * Initiates password reset process by generating a reset token
 * In real application, this token should be sent via email to user
 *
 * Request body should contain:
 * - email: string (user's email address)
 *
 * Returns:
 * - 200: Password reset email sent (if email exists)
 * - 400: Email is required or user not found
 * - 500: Server error
 */
export const forgotPassword = async (request, reply) => {
  try {
    // Extract email from request
    const { email } = request.body;

    // Validate email is provided
    if (!email) {
      return reply.status(400).send({ error: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return reply.status(400).send({ error: "User not found" });
    }

    /**
     * Generate a cryptographically secure random reset token
     * crypto.randomBytes() creates unpredictable token
     * toString("hex") converts it to hexadecimal format
     */
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Set token expiration to 1 hour from now
    // Milliseconds: 3600000 = 60 minutes × 60 seconds × 1000 ms
    const resetTokenExpiry = Date.now() + 3600000;

    // Save reset token and expiry to user document
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    /**
     * TODO: Send password reset email to user
     * The email should contain a link like:
     * https://yourdomain.com/reset-password?token=resetToken
     * User clicks link and sets new password
     * Example: await sendResetEmail(user.email, resetToken);
     */
    // await sendResetEmail(user.email, resetToken);

    reply.send({ message: "Password reset email sent" });
  } catch (err) {
    // Log error and send generic error response
    request.log.error("Error requesting password reset:", err);
    reply.status(500).send({ error: "Error requesting password reset" });
  }
};
