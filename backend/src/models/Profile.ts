import mongoose, { Schema, Document } from "mongoose";

export interface IProfile extends Document {
	_id: string;
	userId: mongoose.Types.ObjectId;
	username: string;
	displayName: string;
	bio?: string;
	avatar?: string;
	theme?: Record<string, unknown>;
	colors?: Record<string, unknown>;
	font?: string;
	backgroundImage?: string;
	createdAt: Date;
	updatedAt: Date;
}

const ProfileSchema: Schema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
		},
		username: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^[a-z0-9_-]+$/, "Username can only contain lowercase letters, numbers, hyphens, and underscores"],
		},
		displayName: {
			type: String,
			required: true,
			trim: true,
		},
		bio: {
			type: String,
			trim: true,
		},
		avatar: {
			type: String,
		},
		theme: {
			type: Schema.Types.Mixed,
		},
		colors: {
			type: Schema.Types.Mixed,
		},
		font: {
			type: String,
		},
		backgroundImage: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

// Index for faster username lookups
ProfileSchema.index({ username: 1 });

export default mongoose.models.Profile || mongoose.model<IProfile>("Profile", ProfileSchema);




