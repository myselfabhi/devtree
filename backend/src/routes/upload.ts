import express from "express";
import multer from "multer";
import { authenticate } from "../middleware/auth.js";
import { uploadImage, deleteImage } from "../controllers/uploadController.js";

const router = express.Router();

// Configure multer for memory storage (we'll upload to R2, not disk)
const storage = multer.memoryStorage();
const upload = multer({
	storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit
	},
});

// POST /api/upload - Upload image to R2
router.post("/", authenticate, upload.single("image"), uploadImage);

// DELETE /api/upload - Delete image from R2
router.delete("/", authenticate, deleteImage);

export default router;







