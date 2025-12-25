import { Request, Response } from "express";
import { fetchGitHubRepo } from "../services/githubService.js";

/**
 * Fetch GitHub repository data and extract project information
 * POST /api/github/fetch
 */
export const fetchGitHub = async (req: Request, res: Response) => {
	try {
		const { githubUrl } = req.body;

		if (!githubUrl) {
			return res.status(400).json({
				success: false,
				message: "GitHub URL is required",
			});
		}

		// Validate URL format
		if (typeof githubUrl !== "string") {
			return res.status(400).json({
				success: false,
				message: "GitHub URL must be a string",
			});
		}

		// Fetch and process GitHub repo
		const result = await fetchGitHubRepo(githubUrl);

		res.status(200).json({
			success: true,
			data: result,
		});
	} catch (error: any) {
		console.error("GitHub fetch error:", error);
		
		const message = error.message || "Failed to fetch GitHub repository";
		
		res.status(400).json({
			success: false,
			message,
		});
	}
};

