import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "";

if (!JWT_SECRET) {
	throw new Error("JWT_SECRET is not defined in environment variables");
}

interface SignupBody {
	email: string;
	password: string;
	name: string;
}

interface LoginBody {
	email: string;
	password: string;
}

export const signup = async (req: Request<{}, {}, SignupBody>, res: Response) => {
	try {
		const { email, password, name } = req.body;

		// Validation
		if (!email || !password || !name) {
			return res.status(400).json({
				success: false,
				message: "Email, password, and name are required",
			});
		}

		// Email format validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({
				success: false,
				message: "Invalid email format",
			});
		}

		// Password strength validation
		if (password.length < 8) {
			return res.status(400).json({
				success: false,
				message: "Password must be at least 8 characters long",
			});
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email: email.toLowerCase() });
		if (existingUser) {
			return res.status(409).json({
				success: false,
				message: "User with this email already exists",
			});
		}

		// Hash password
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// Create user
		const user = new User({
			email: email.toLowerCase(),
			password: hashedPassword,
			name: name.trim(),
		});

		await user.save();

		// Generate JWT token
		const token = jwt.sign(
			{
				userId: user._id.toString(),
				email: user.email,
			},
			JWT_SECRET,
			{ expiresIn: "7d" }
		);

		// Return user data (without password)
		res.status(201).json({
			success: true,
			message: "User created successfully",
			data: {
				user: {
					id: user._id,
					email: user.email,
					name: user.name,
				},
				token,
			},
		});
	} catch (error) {
		console.error("Signup error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

export const login = async (req: Request<{}, {}, LoginBody>, res: Response) => {
	try {
		const { email, password } = req.body;

		// Validation
		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: "Email and password are required",
			});
		}

		// Find user
		const user = await User.findOne({ email: email.toLowerCase() });
		if (!user) {
			return res.status(401).json({
				success: false,
				message: "Invalid email or password",
			});
		}

		// Verify password
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(401).json({
				success: false,
				message: "Invalid email or password",
			});
		}

		// Generate JWT token
		const token = jwt.sign(
			{
				userId: user._id.toString(),
				email: user.email,
			},
			JWT_SECRET,
			{ expiresIn: "7d" }
		);

		// Return user data (without password)
		res.status(200).json({
			success: true,
			message: "Login successful",
			data: {
				user: {
					id: user._id,
					email: user.email,
					name: user.name,
				},
				token,
			},
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

export const getCurrentUser = async (req: Request, res: Response) => {
	try {
		// req.userId is set by auth middleware
		const userId = (req as any).userId;

		const user = await User.findById(userId).select("-password");
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		res.status(200).json({
			success: true,
			data: {
				user: {
					id: user._id,
					email: user.email,
					name: user.name,
				},
			},
		});
	} catch (error) {
		console.error("Get current user error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};




