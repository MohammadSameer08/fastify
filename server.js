require("dotenv").config();
const fastify = require("fastify")({ logger: true });

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
