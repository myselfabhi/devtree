/**
 * Migration script to add default values for new fields to existing links
 * 
 * Run this script once after deploying the schema changes:
 * npx tsx src/scripts/migrateLinks.ts
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Link from "../models/Link.js";

dotenv.config();

async function migrateLinks() {
	try {
		console.log("Connecting to database...");
		await connectDB();

		console.log("Starting migration...");

		// Find all links without the new fields set
		const linksToMigrate = await Link.find({
			$or: [
				{ techStack: { $exists: false } },
				{ role: { $exists: false } },
				{ status: { $exists: false } },
			],
		});

		console.log(`Found ${linksToMigrate.length} links to migrate`);

		let migrated = 0;
		for (const link of linksToMigrate) {
			// Set default values if fields don't exist
			if (!link.techStack) {
				link.techStack = [];
			}
			if (!link.role) {
				link.role = "Full Stack";
			}
			if (!link.status) {
				link.status = "unknown";
			}

			await link.save();
			migrated++;
		}

		console.log(`✅ Successfully migrated ${migrated} links`);
		console.log("Migration completed!");

		process.exit(0);
	} catch (error) {
		console.error("Migration error:", error);
		process.exit(1);
	}
}

migrateLinks();
