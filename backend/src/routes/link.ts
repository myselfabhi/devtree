import express from "express";
import {
	createLink,
	getLinks,
	updateLink,
	deleteLink,
	reorderLinks,
	getPublicLinks,
	trackLinkClick,
} from "../controllers/linkController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/public/:username", getPublicLinks);
router.get("/track/:id", trackLinkClick);

// Protected routes (require authentication)
router.post("/", authenticate, createLink);
router.get("/", authenticate, getLinks);
router.put("/:id", authenticate, updateLink);
router.delete("/:id", authenticate, deleteLink);
router.put("/reorder", authenticate, reorderLinks);

export default router;



