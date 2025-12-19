import express from "express";
import { signup, login, getCurrentUser } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected routes (require authentication)
router.get("/me", authenticate, getCurrentUser);

export default router;

