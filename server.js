import Fastify from "fastify";
import dotenv from "dotenv";
import cors from "@fastify/cors";
import mongoDbPlugin from "./plugins/mongodb.js";

dotenv.config();

const fastify = Fastify({ logger: true });

fastify.register(cors, {
  origin: "*", // Allow all origins
});

fastify.register(mongoDbPlugin);

fastify.get("/test-db", async (request, reply) => {
  try {
    const connectionState = fastify.mongoose.connection.readyState; // Check if the connection is ready
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

fastify.get("/", async (request, reply) => {
  reply.send({ message: "Hello, Fastify!" });
});

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT });
    fastify.log.info(`Server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
