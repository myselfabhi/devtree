import express from "express";
import { fetchGitHub } from "../controllers/githubController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Test endpoint to verify route is accessible (no auth required)
router.get("/test", (req, res) => {
	res.json({ success: true, message: "GitHub routes are working" });
});

// GitHub integration routes (require authentication)
router.post("/fetch", authenticate, fetchGitHub);

export default router;

