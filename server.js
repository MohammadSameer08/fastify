/**
 * Main Fastify Server Setup
 * This file initializes and configures the Fastify web server with middleware,
 * database connections, and route handlers.
 */

import Fastify from "fastify";
import dotenv from "dotenv";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import mongoDbPlugin from "./plugins/mongodb.js";
import authRoutes from "./routes/auth.js";

// Load environment variables from .env file
dotenv.config();

// Initialize Fastify with logging enabled
// Logger helps with debugging and monitoring server activity
const fastify = Fastify({ logger: true });

/**
 * Register CORS middleware
 * CORS (Cross-Origin Resource Sharing) allows requests from different domains
 * origin: "*" means requests from any domain are allowed
 */
fastify.register(cors, {
  origin: "*", // Allow all origins (can be restricted in production)
});

/**
 * Register MongoDB connection plugin
 * This plugin establishes connection to MongoDB database
 */
fastify.register(mongoDbPlugin);

/**
 * Register cookie plugin
 * This plugin allows setting and reading cookies in Fastify
 */
fastify.register(cookie);

/**
 * Health check endpoint to verify MongoDB connection
 * GET /test-db
 * Returns: Success message if MongoDB is connected, error if not
 * readyState: 1 = connected, 0 = disconnected, 2 = connecting, 3 = disconnecting
 */
fastify.get("/test-db", async (request, reply) => {
  try {
    // Check MongoDB connection status
    const connectionState = fastify.mongoose.connection.readyState;

    // State 1 means MongoDB is connected and ready
    if (connectionState === 1) {
      reply.send({ message: "MongoDB connection is working!" });
    } else {
      reply.status(500).send({ error: "MongoDB connection is not ready" });
    }
  } catch (err) {
    fastify.log.error("Error testing MongoDB connection:", err);
    reply.status(500).send({ error: "Error testing MongoDB connection" });
  }
});

/**
 * Welcome endpoint
 * GET /
 * Returns: Simple greeting message to verify server is running
 */
fastify.get("/", async (request, reply) => {
  reply.send({ message: "Hello, Fastify!" });
});

// Register authentication routes
fastify.register(authRoutes, { prefix: "/api/auth" }); // All auth routes will be prefixed with /api/auth

/**
 * Start the server
 * Listens on port specified in PORT environment variable
 * If connection fails, logs error and exits process
 */
const start = async () => {
  try {
    // Start listening on specified port (from .env file)
    await fastify.listen({ port: process.env.PORT });
    fastify.log.info(`Server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Initialize the server
start();
