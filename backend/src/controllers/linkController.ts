import { Request, Response } from "express";
import mongoose from "mongoose";
import Link from "../models/Link.js";
import Profile from "../models/Profile.js";

interface CreateLinkBody {
	title: string;
	url: string;
	icon?: string;
	description?: string;
}

interface UpdateLinkBody {
	title?: string;
	url?: string;
	icon?: string;
	description?: string;
}

interface ReorderLinksBody {
	linkIds: string[];
}

// URL validation
const isValidUrl = (url: string): boolean => {
	try {
		const urlObj = new URL(url);
		return urlObj.protocol === "http:" || urlObj.protocol === "https:";
	} catch {
		return false;
	}
};

export const createLink = async (
	req: Request<{}, {}, CreateLinkBody>,
	res: Response
) => {
	try {
		const userId = req.userId;
		if (!userId) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
		}

		const { title, url, icon, description } = req.body;

		// Validation
		if (!title || !url) {
			return res.status(400).json({
				success: false,
				message: "Title and URL are required",
			});
		}

		// Validate URL format
		if (!isValidUrl(url)) {
			return res.status(400).json({
				success: false,
				message: "Invalid URL format. Must start with http:// or https://",
			});
		}

		// Get user's profile
		const profile = await Profile.findOne({ userId });
		if (!profile) {
			return res.status(404).json({
				success: false,
				message: "Profile not found. Create a profile first.",
			});
		}

		// Get current max order for this profile
		const maxOrderLink = await Link.findOne({ profileId: profile._id })
			.sort({ order: -1 })
			.limit(1);

		const nextOrder = maxOrderLink ? maxOrderLink.order + 1 : 0;

		// Create link
		const link = new Link({
			profileId: profile._id,
			title: title.trim(),
			url: url.trim(),
			icon: icon?.trim(),
			description: description?.trim(),
			order: nextOrder,
			clicks: 0,
		});

		await link.save();

		res.status(201).json({
			success: true,
			message: "Link created successfully",
			data: { link },
		});
	} catch (error) {
		console.error("Create link error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

export const getLinks = async (req: Request, res: Response) => {
	try {
		const userId = req.userId;
		if (!userId) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
		}

		// Get user's profile
		const profile = await Profile.findOne({ userId });
		if (!profile) {
			return res.status(404).json({
				success: false,
				message: "Profile not found. Create a profile first.",
			});
		}

		// Get all links for this profile, sorted by order
		const links = await Link.find({ profileId: profile._id }).sort({ order: 1 });

		res.status(200).json({
			success: true,
			data: { links },
		});
	} catch (error) {
		console.error("Get links error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

export const updateLink = async (
	req: Request<{ id: string }, {}, UpdateLinkBody>,
	res: Response
) => {
	try {
		const userId = req.userId;
		if (!userId) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
		}

		const { id } = req.params;
		const { title, url, icon, description } = req.body;

		// Get user's profile
		const profile = await Profile.findOne({ userId });
		if (!profile) {
			return res.status(404).json({
				success: false,
				message: "Profile not found",
			});
		}

		// Find link and verify it belongs to user's profile
		const link = await Link.findOne({
			_id: id,
			profileId: profile._id,
		});

		if (!link) {
			return res.status(404).json({
				success: false,
				message: "Link not found",
			});
		}

		// Update fields
		if (title !== undefined) {
			link.title = title.trim();
		}
		if (url !== undefined) {
			if (!isValidUrl(url)) {
				return res.status(400).json({
					success: false,
					message: "Invalid URL format. Must start with http:// or https://",
				});
			}
			link.url = url.trim();
		}
		if (icon !== undefined) {
			link.icon = icon.trim() || undefined;
		}
		if (description !== undefined) {
			link.description = description.trim() || undefined;
		}

		await link.save();

		res.status(200).json({
			success: true,
			message: "Link updated successfully",
			data: { link },
		});
	} catch (error) {
		console.error("Update link error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

export const deleteLink = async (req: Request<{ id: string }>, res: Response) => {
	try {
		const userId = req.userId;
		if (!userId) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
		}

		const { id } = req.params;

		// Get user's profile
		const profile = await Profile.findOne({ userId });
		if (!profile) {
			return res.status(404).json({
				success: false,
				message: "Profile not found",
			});
		}

		// Find link and verify it belongs to user's profile
		const link = await Link.findOne({
			_id: id,
			profileId: profile._id,
		});

		if (!link) {
			return res.status(404).json({
				success: false,
				message: "Link not found",
			});
		}

		// Delete link
		await Link.deleteOne({ _id: id });

		// Reorder remaining links to fill gaps
		const remainingLinks = await Link.find({ profileId: profile._id }).sort({
			order: 1,
		});
		for (let i = 0; i < remainingLinks.length; i++) {
			remainingLinks[i].order = i;
			await remainingLinks[i].save();
		}

		res.status(200).json({
			success: true,
			message: "Link deleted successfully",
		});
	} catch (error) {
		console.error("Delete link error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

export const reorderLinks = async (
	req: Request<{}, {}, ReorderLinksBody>,
	res: Response
) => {
	try {
		const userId = req.userId;
		if (!userId) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
		}

		const { linkIds } = req.body;
		console.log("Reorder request - linkIds:", linkIds);
		console.log("Reorder request - userId:", userId);

		if (!Array.isArray(linkIds) || linkIds.length === 0) {
			return res.status(400).json({
				success: false,
				message: "linkIds must be a non-empty array",
			});
		}

		// Get user's profile
		const profile = await Profile.findOne({ userId });
		if (!profile) {
			console.log("Profile not found for userId:", userId);
			return res.status(404).json({
				success: false,
				message: "Profile not found",
			});
		}

		console.log("Profile found:", profile._id);

		// Mongoose can handle string IDs in $in queries, but let's be explicit
		// Verify all links belong to user's profile
		const links = await Link.find({
			_id: { $in: linkIds },
			profileId: profile._id,
		});

		console.log("Found links:", links.length, "Expected:", linkIds.length);

		if (links.length !== linkIds.length) {
			return res.status(400).json({
				success: false,
				message: "Some links not found or don't belong to your profile",
			});
		}

		// Update order for each link using bulkWrite for better performance
		const bulkOps = linkIds.map((linkId, index) => ({
			updateOne: {
				filter: { _id: linkId, profileId: profile._id },
				update: { $set: { order: index } },
			},
		}));

		await Link.bulkWrite(bulkOps);

		// Get updated links
		const updatedLinks = await Link.find({
			_id: { $in: linkIds },
			profileId: profile._id,
		}).sort({ order: 1 });

		console.log("Reorder successful");

		res.status(200).json({
			success: true,
			message: "Links reordered successfully",
			data: { links: updatedLinks },
		});
	} catch (error: any) {
		console.error("Reorder links error:", error);
		console.error("Error stack:", error.stack);
		res.status(500).json({
			success: false,
			message: error.message || "Internal server error",
		});
	}
};

export const getPublicLinks = async (req: Request, res: Response) => {
	try {
		const { username } = req.params;

		if (!username) {
			return res.status(400).json({
				success: false,
				message: "Username is required",
			});
		}

		// Get profile by username
		const profile = await Profile.findOne({
			username: username.toLowerCase(),
		});

		if (!profile) {
			return res.status(404).json({
				success: false,
				message: "Profile not found",
			});
		}

		// Get all links for this profile, sorted by order
		const links = await Link.find({ profileId: profile._id })
			.sort({ order: 1 })
			.select("-clicks"); // Don't expose click count in public API

		res.status(200).json({
			success: true,
			data: { links },
		});
	} catch (error) {
		console.error("Get public links error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

export const trackLinkClick = async (req: Request<{ id: string }>, res: Response) => {
	try {
		const { id } = req.params;

		// Find link
		const link = await Link.findById(id);
		if (!link) {
			return res.status(404).json({
				success: false,
				message: "Link not found",
			});
		}

		// Increment click count
		link.clicks += 1;
		await link.save();

		// Return the URL to redirect to
		res.status(200).json({
			success: true,
			data: {
				url: link.url,
			},
		});
	} catch (error) {
		console.error("Track link click error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};



