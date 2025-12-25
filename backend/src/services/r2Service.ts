import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

function getR2Config() {
	const accountId = process.env.R2_ACCOUNT_ID;
	const accessKeyId = process.env.R2_ACCESS_KEY_ID;
	const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
	const bucketName = process.env.R2_BUCKET_NAME || "linktree-image";
	const publicUrl = process.env.R2_PUBLIC_URL || `https://pub-${accountId}.r2.dev`;
	
	return { accountId, accessKeyId, secretAccessKey, bucketName, publicUrl };
}

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
	if (!s3Client) {
		const config = getR2Config();
		if (!config.accountId || !config.accessKeyId || !config.secretAccessKey) {
			throw new Error("R2 credentials are not configured");
		}
		s3Client = new S3Client({
			region: "auto",
			endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId: config.accessKeyId.trim(),
				secretAccessKey: config.secretAccessKey.trim(),
			},
		});
	}
	return s3Client;
}

/**
 * Upload image to R2
 * @param fileBuffer - Image file as Buffer
 * @param fileName - Original filename
 * @param contentType - MIME type (e.g., 'image/jpeg')
 * @param folder - Optional folder prefix (e.g., 'avatars', 'backgrounds')
 * @returns Public URL of uploaded image
 */
export async function uploadToR2(
	fileBuffer: Buffer,
	fileName: string,
	contentType: string,
	folder: "avatars" | "backgrounds" | "screenshots" = "avatars"
): Promise<string> {
	try {
		const config = getR2Config();
		const fileExtension = fileName.split(".").pop() || "jpg";
		const uniqueFileName = `${folder}/${randomUUID()}-${Date.now()}.${fileExtension}`;

		const command = new PutObjectCommand({
			Bucket: config.bucketName,
			Key: uniqueFileName,
			Body: fileBuffer,
			ContentType: contentType,
		});

		await getS3Client().send(command);
		return `${config.publicUrl}/${uniqueFileName}`;
	} catch (error) {
		console.error("R2 upload error:", error);
		throw new Error("Failed to upload image to R2");
	}
}

/**
 * Delete image from R2
 * @param imageUrl - Full public URL of image to delete
 */
export async function deleteFromR2(imageUrl: string): Promise<void> {
	try {
		const config = getR2Config();
		const urlParts = imageUrl.split(`${config.publicUrl}/`);
		if (urlParts.length !== 2) {
			throw new Error("Invalid R2 URL format");
		}

		const key = urlParts[1];

		const command = new DeleteObjectCommand({
			Bucket: config.bucketName,
			Key: key,
		});

		await getS3Client().send(command);
	} catch (error) {
		console.error("R2 delete error:", error);
	}
}

export function getR2KeyFromUrl(url: string): string | null {
	try {
		const config = getR2Config();
		const urlParts = url.split(`${config.publicUrl}/`);
		return urlParts.length === 2 ? urlParts[1] : null;
	} catch {
		return null;
	}
}
