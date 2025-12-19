import mongoose, { Schema, Document } from "mongoose";

export interface ILink extends Document {
	_id: string;
	profileId: mongoose.Types.ObjectId;
	title: string;
	url: string;
	icon?: string;
	description?: string;
	order: number;
	clicks: number;
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
			required: true,
			trim: true,
		},
		icon: {
			type: String,
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
	},
	{
		timestamps: true,
	}
);

// Index for faster profile link queries
LinkSchema.index({ profileId: 1, order: 1 });

export default mongoose.models.Link || mongoose.model<ILink>("Link", LinkSchema);




