import express from "express";
import {
	createProfile,
	getProfile,
	updateProfile,
	getPublicProfile,
	checkUsernameAvailability,
} from "../controllers/profileController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Public routes (more specific routes first)
router.get("/check/username", checkUsernameAvailability);

// Protected routes (require authentication) - MUST come before /:username
router.post("/", authenticate, createProfile);
router.get("/", authenticate, getProfile);
router.put("/", authenticate, updateProfile);

// Public routes with parameters (must come last to avoid catching protected routes)
router.get("/:username", getPublicProfile);

export default router;

