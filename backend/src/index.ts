import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes will go here
app.get("/api", (req, res) => {
	res.json({ message: "Linktree Backend API" });
});

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

