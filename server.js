import Fastify from "fastify";
import dotenv from "dotenv";
import cors from "@fastify/cors";

dotenv.config();

const fastify = Fastify({ logger: true });

fastify.register(cors, {
  origin: "*", // Allow all origins
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
