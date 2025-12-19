import { Request, Response } from "express";
import Profile from "../models/Profile.js";
import User from "../models/User.js";

interface CreateProfileBody {
	username: string;
	displayName: string;
	bio?: string;
	avatar?: string;
}

interface UpdateProfileBody {
	username?: string;
	displayName?: string;
	bio?: string;
	avatar?: string;
	theme?: Record<string, unknown>;
	colors?: Record<string, unknown>;
	font?: string;
	backgroundImage?: string;
}

// Username validation regex: lowercase letters, numbers, hyphens, underscores
const USERNAME_REGEX = /^[a-z0-9_-]+$/;
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 30;

const validateUsername = (username: string): string | null => {
	if (username.length < USERNAME_MIN_LENGTH) {
		return `Username must be at least ${USERNAME_MIN_LENGTH} characters`;
	}
	if (username.length > USERNAME_MAX_LENGTH) {
		return `Username must be at most ${USERNAME_MAX_LENGTH} characters`;
	}
	if (!USERNAME_REGEX.test(username)) {
		return "Username can only contain lowercase letters, numbers, hyphens, and underscores";
	}
	return null;
};

export const createProfile = async (
	req: Request<{}, {}, CreateProfileBody>,
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

		const { username, displayName, bio, avatar, font } = req.body;

		// Validation
		if (!username || !displayName) {
			return res.status(400).json({
				success: false,
				message: "Username and display name are required",
			});
		}

		// Validate username format
		const usernameError = validateUsername(username.toLowerCase());
		if (usernameError) {
			return res.status(400).json({
				success: false,
				message: usernameError,
			});
		}

		// Check if user already has a profile
		const existingProfile = await Profile.findOne({ userId });
		if (existingProfile) {
			return res.status(409).json({
				success: false,
				message: "Profile already exists. Use PUT to update.",
			});
		}

		// Check if username is taken
		const usernameTaken = await Profile.findOne({
			username: username.toLowerCase(),
		});
		if (usernameTaken) {
			return res.status(409).json({
				success: false,
				message: "Username is already taken",
			});
		}

		// Create profile
		const profile = new Profile({
			userId,
			username: username.toLowerCase(),
			displayName: displayName.trim(),
			bio: bio?.trim(),
			avatar,
			font: font?.trim() || undefined,
		});

		await profile.save();

		res.status(201).json({
			success: true,
			message: "Profile created successfully",
			data: { profile },
		});
	} catch (error) {
		console.error("Create profile error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

export const getProfile = async (req: Request, res: Response) => {
	try {
		const userId = req.userId;
		if (!userId) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
		}

		const profile = await Profile.findOne({ userId }).populate("userId", "email name");

		if (!profile) {
			return res.status(404).json({
				success: false,
				message: "Profile not found",
			});
		}

		res.status(200).json({
			success: true,
			data: { profile },
		});
	} catch (error) {
		console.error("Get profile error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

export const updateProfile = async (
	req: Request<{}, {}, UpdateProfileBody>,
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

		const profile = await Profile.findOne({ userId });
		if (!profile) {
			return res.status(404).json({
				success: false,
				message: "Profile not found. Create a profile first.",
			});
		}

		const { username, displayName, bio, avatar, theme, colors, font, backgroundImage } =
			req.body;

		// If username is being updated, validate and check uniqueness
		if (username) {
			const usernameError = validateUsername(username.toLowerCase());
			if (usernameError) {
				return res.status(400).json({
					success: false,
					message: usernameError,
				});
			}

			// Check if new username is taken by another user
			const usernameTaken = await Profile.findOne({
				username: username.toLowerCase(),
				userId: { $ne: userId },
			});
			if (usernameTaken) {
				return res.status(409).json({
					success: false,
					message: "Username is already taken",
				});
			}

			profile.username = username.toLowerCase();
		}

		// Update fields
		if (displayName !== undefined) {
			profile.displayName = displayName.trim();
		}
		if (bio !== undefined) {
			profile.bio = bio.trim() || undefined;
		}
		if (avatar !== undefined) {
			profile.avatar = avatar || undefined;
		}
		if (theme !== undefined) {
			profile.theme = theme;
		}
		if (colors !== undefined) {
			profile.colors = colors;
		}
		if (font !== undefined) {
			profile.font = font;
		}
		if (backgroundImage !== undefined) {
			profile.backgroundImage = backgroundImage || undefined;
		}

		await profile.save();

		res.status(200).json({
			success: true,
			message: "Profile updated successfully",
			data: { profile },
		});
	} catch (error) {
		console.error("Update profile error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

export const getPublicProfile = async (req: Request, res: Response) => {
	try {
		const { username } = req.params;

		if (!username) {
			return res.status(400).json({
				success: false,
				message: "Username is required",
			});
		}

		const profile = await Profile.findOne({
			username: username.toLowerCase(),
		}).populate("userId", "name email");

		if (!profile) {
			return res.status(404).json({
				success: false,
				message: "Profile not found",
			});
		}

		// Return public profile data (exclude sensitive info)
		res.status(200).json({
			success: true,
			data: {
				profile: {
					id: profile._id,
					username: profile.username,
					displayName: profile.displayName,
					bio: profile.bio,
					avatar: profile.avatar,
					theme: profile.theme,
					colors: profile.colors,
					font: profile.font,
					backgroundImage: profile.backgroundImage,
					createdAt: profile.createdAt,
				},
			},
		});
	} catch (error) {
		console.error("Get public profile error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

export const checkUsernameAvailability = async (req: Request, res: Response) => {
	try {
		const { username } = req.query;

		if (!username || typeof username !== "string") {
			return res.status(400).json({
				success: false,
				message: "Username is required",
			});
		}

		// Validate username format
		const usernameError = validateUsername(username.toLowerCase());
		if (usernameError) {
			return res.status(400).json({
				success: false,
				message: usernameError,
				available: false,
			});
		}

		// Check if username is taken
		const existing = await Profile.findOne({
			username: username.toLowerCase(),
		});

		res.status(200).json({
			success: true,
			data: {
				username: username.toLowerCase(),
				available: !existing,
			},
		});
	} catch (error) {
		console.error("Check username availability error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};



