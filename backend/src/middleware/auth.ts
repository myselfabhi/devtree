import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

interface JwtPayload {
	userId: string;
	email: string;
}

// Extend Request type to include userId
declare global {
	namespace Express {
		interface Request {
			userId?: string;
		}
	}
}

export const authenticate = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		// Get token from header
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			return res.status(401).json({
				success: false,
				message: "No token provided",
			});
		}

		// Extract token from "Bearer <token>"
		const token = authHeader.startsWith("Bearer ")
			? authHeader.slice(7)
			: authHeader;

		if (!token) {
			return res.status(401).json({
				success: false,
				message: "No token provided",
			});
		}

		// Verify token
		const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

		// Attach userId to request
		req.userId = decoded.userId;

		next();
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			return res.status(401).json({
				success: false,
				message: "Invalid token",
			});
		}

		if (error instanceof jwt.TokenExpiredError) {
			return res.status(401).json({
				success: false,
				message: "Token expired",
			});
		}

		console.error("Auth middleware error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};





