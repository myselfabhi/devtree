import { Request, Response } from "express";
import { uploadToR2, deleteFromR2 } from "../services/r2Service.js";

interface UploadRequest extends Request {
	file?: Express.Multer.File;
	userId?: string;
}

/**
 * Upload image to R2
 * POST /api/upload
 * Body: multipart/form-data with 'image' field
 * Query: ?type=avatar|background
 */
export const uploadImage = async (req: UploadRequest, res: Response) => {
	try {
		if (!req.userId) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
		}

		if (!req.file) {
			return res.status(400).json({
				success: false,
				message: "No image file provided",
			});
		}

		if (!req.file.mimetype.startsWith("image/")) {
			return res.status(400).json({
				success: false,
				message: "File must be an image",
			});
		}

		if (req.file.size > 5 * 1024 * 1024) {
			return res.status(400).json({
				success: false,
				message: "Image size must be less than 5MB",
			});
		}

		const type = (req.query.type as string) || "avatar";
		const folder = type === "background" ? "backgrounds" : "avatars";
		const publicUrl = await uploadToR2(
			req.file.buffer,
			req.file.originalname,
			req.file.mimetype,
			folder
		);

		res.status(200).json({
			success: true,
			data: {
				url: publicUrl,
			},
		});
	} catch (error) {
		console.error("Upload image error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to upload image",
		});
	}
};

/**
 * Delete image from R2
 * DELETE /api/upload
 * Body: { url: "https://..." }
 */
export const deleteImage = async (req: UploadRequest, res: Response) => {
	try {
		if (!req.userId) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
		}

		const { url } = req.body;

		if (!url) {
			return res.status(400).json({
				success: false,
				message: "Image URL is required",
			});
		}

		await deleteFromR2(url);

		res.status(200).json({
			success: true,
			message: "Image deleted successfully",
		});
	} catch (error) {
		console.error("Delete image error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to delete image",
		});
	}
};
