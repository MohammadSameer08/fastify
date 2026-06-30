import fb from "fastify-plugin";
import mongoose from "mongoose";

const mongodbPlugin = async (fastify, options) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    fastify.decorate("mongoose", mongoose);
    fastify.log.info("Connected to MongoDB");
  } catch (err) {
    fastify.log.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
};

export default fb(mongodbPlugin);
