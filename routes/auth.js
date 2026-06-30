import {
  registerUser,
  loginUser,
  resetPassword,
  forgotPassword,
} from "../controllers/authController.js";

const authRoutes = async (fastify) => {
  // User registration route
  fastify.post("/register", registerUser);

  // User login route
  fastify.post("/login", loginUser);

  // Forgot password route
  fastify.post("/forgot-password", forgotPassword);

  // Reset password route
  fastify.post("/reset-password/:token", resetPassword);
};

export default authRoutes;
