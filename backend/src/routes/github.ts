import express from "express";
import { fetchGitHub } from "../controllers/githubController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// GitHub integration routes (require authentication)
router.post("/fetch", authenticate, fetchGitHub);

export default router;

