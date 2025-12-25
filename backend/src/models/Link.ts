import mongoose, { Schema, Document } from "mongoose";

export interface ILink extends Document {
	profileId: mongoose.Types.ObjectId;
	title: string;
	url?: string;
	description?: string;
	order: number;
	clicks: number;
	techStack?: string[];
	role?: "Frontend" | "Backend" | "Full Stack";
	githubUrl?: string;
	status?: "live" | "down" | "slow" | "unknown";
	lastCheckedAt?: Date;
	screenshotUrl?: string;
	githubStars?: number;
	lastCommitDate?: Date;
	lastCommitMessage?: string;
	lighthousePerformance?: number;
	lighthouseAccessibility?: number;
	lighthouseBestPractices?: number;
	lighthouseSEO?: number;
	lighthouseLastRun?: Date;
	createdAt: Date;
	updatedAt: Date;
}

const LinkSchema: Schema = new Schema(
	{
		profileId: {
			type: Schema.Types.ObjectId,
			ref: "Profile",
			required: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
		},
		url: {
			type: String,
			required: false,
			trim: true,
		},
		description: {
			type: String,
			trim: true,
		},
		order: {
			type: Number,
			required: true,
			default: 0,
		},
		clicks: {
			type: Number,
			default: 0,
		},
		techStack: {
			type: [String],
			default: [],
		},
		role: {
			type: String,
			enum: ["Frontend", "Backend", "Full Stack"],
			default: "Full Stack",
		},
		githubUrl: {
			type: String,
			trim: true,
		},
		status: {
			type: String,
			enum: ["live", "down", "slow", "unknown"],
			default: "unknown",
		},
		lastCheckedAt: {
			type: Date,
		},
		screenshotUrl: {
			type: String,
			trim: true,
		},
		githubStars: {
			type: Number,
		},
		lastCommitDate: {
			type: Date,
		},
		lastCommitMessage: {
			type: String,
		},
		lighthousePerformance: {
			type: Number,
		},
		lighthouseAccessibility: {
			type: Number,
		},
		lighthouseBestPractices: {
			type: Number,
		},
		lighthouseSEO: {
			type: Number,
		},
		lighthouseLastRun: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
);

// Index for faster profile link queries
LinkSchema.index({ profileId: 1, order: 1 });

export default mongoose.models.Link || mongoose.model<ILink>("Link", LinkSchema);




