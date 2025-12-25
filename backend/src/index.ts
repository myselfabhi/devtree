import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import linkRoutes from "./routes/link.js";
import uploadRoutes from "./routes/upload.js";
import githubRoutes from "./routes/github.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.get("/api", (req, res) => {
	res.json({ message: "Linktree Backend API" });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// GitHub routes
app.use("/api/github", githubRoutes);

// Profile routes
app.use("/api/profile", profileRoutes);

// Link routes
app.use("/api/links", linkRoutes);

// Upload routes
app.use("/api/upload", uploadRoutes);

// Connect to MongoDB and start server
connectDB()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`🚀 Backend server running on http://localhost:${PORT}`);
		});
	})
	.catch((error) => {
		console.error("❌ Failed to connect to MongoDB:", error);
		process.exit(1);
	});

