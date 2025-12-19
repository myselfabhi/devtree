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
router.get("/:username", getPublicProfile);

// Protected routes (require authentication)
router.post("/", authenticate, createProfile);
router.get("/", authenticate, getProfile);
router.put("/", authenticate, updateProfile);

export default router;

