/**
 * MongoDB Plugin for Fastify
 * This plugin establishes the connection to MongoDB database
 * It uses Mongoose as the ODM (Object Document Mapper) to interact with MongoDB
 */

import fb from "fastify-plugin";
import mongoose from "mongoose";

/**
 * MongoDB Plugin Function
 * @param {object} fastify - Fastify server instance
 * @param {object} options - Plugin configuration options
 *
 * This plugin:
 * 1. Connects to MongoDB using the connection string from environment variables
 * 2. Makes mongoose available throughout the entire Fastify app via fastify.mongoose
 * 3. Logs connection status for debugging
 */
const mongodbPlugin = async (fastify, options) => {
  try {
    // Connect to MongoDB using connection string from .env (MONGODB_URI)
    // Example: mongodb://localhost:27017/database-name
    // or: mongodb+srv://username:password@cluster.mongodb.net/database-name
    await mongoose.connect(process.env.MONGODB_URI);

    // Make mongoose available throughout the app as fastify.mongoose
    // This allows other parts of the app to access database models
    fastify.decorate("mongoose", mongoose);

    // Log successful connection
    fastify.log.info("Connected to MongoDB");
  } catch (err) {
    // Handle connection errors
    fastify.log.error("Error connecting to MongoDB:", err);
    // Exit process if MongoDB connection fails (app can't work without DB)
    process.exit(1);
  }
};

/**
 * Export plugin wrapped with fastify-plugin
 * fastify-plugin ensures this plugin is loaded before other plugins
 * that might depend on the MongoDB connection
 */
export default fb(mongodbPlugin);
