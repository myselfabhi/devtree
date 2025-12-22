"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "./button";
import { cn } from "./utils";
import { uploadApi } from "@/lib/api";

interface BackgroundUploadProps {
	value?: string;
	onChange: (value: string) => void;
	className?: string;
}

export function BackgroundUpload({ value, onChange, className }: BackgroundUploadProps) {
	const { data: session } = useSession();
	const [preview, setPreview] = useState<string | null>(value || null);
	const [isDragging, setIsDragging] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		setPreview(value || null);
	}, [value]);

	const handleFileSelect = async (file: File) => {
		if (!file.type.startsWith("image/")) {
			alert("Please select an image file");
			return;
		}

		// Check file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			alert("Image size must be less than 5MB");
			return;
		}

		// Show local preview immediately
		const reader = new FileReader();
		reader.onloadend = () => {
			setPreview(reader.result as string);
		};
		reader.readAsDataURL(file);

		// Upload to R2
		if (!session?.accessToken) {
			alert("Please log in to upload images");
			return;
		}

		setIsUploading(true);
		try {
			const response = await uploadApi.upload(file, "background", session.accessToken as string);
			if (response.success && response.data.url) {
				const imageUrl = response.data.url;
				setPreview(imageUrl);
				onChange(imageUrl);
			} else {
				throw new Error("Upload failed");
			}
		} catch (error: any) {
			console.error("Upload error:", error);
			alert(error.message || "Failed to upload image. Please try again.");
			setPreview(value || null); // Revert to previous value
		} finally {
			setIsUploading(false);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);

		const file = e.dataTransfer.files[0];
		if (file) {
			handleFileSelect(file);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleFileSelect(file);
		}
	};

	const handleRemove = () => {
		setPreview(null);
		onChange("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div className={cn("space-y-3", className)}>
			<label className="block text-sm font-medium text-[var(--text-secondary)]">
				Background Image (Optional)
			</label>
			
			<div
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				className={cn(
					"relative border-2 border-dashed rounded-xl transition-all overflow-hidden",
					isDragging
						? "border-[var(--accent-purple)] bg-[var(--accent-purple)]/10"
						: "border-[var(--card-border)] hover:border-[var(--accent-purple)]/50",
					preview ? "p-0" : "p-6"
				)}
			>
				{preview ? (
					<div className="relative group">
						<div className="relative w-full h-48 overflow-hidden rounded-lg">
							{isUploading ? (
								<div className="w-full h-full flex items-center justify-center bg-[var(--bg-secondary)]">
									<Loader2 className="animate-spin text-[var(--accent-purple)]" size={32} />
								</div>
							) : (
								<img
									src={preview}
									alt="Background preview"
									className="w-full h-full object-cover"
								/>
							)}
							{!isUploading && (
								<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => fileInputRef.current?.click()}
										className="bg-white/10 hover:bg-white/20 border-white/30 text-white"
									>
										<Upload size={16} className="mr-2" />
										Change
									</Button>
									<Button
										type="button"
										variant="destructive"
										size="sm"
										onClick={handleRemove}
										className="bg-red-500/80 hover:bg-red-600/80"
									>
										<X size={16} className="mr-2" />
										Remove
									</Button>
								</div>
							)}
						</div>
					</div>
				) : (
					<div className="text-center">
						<div className="mx-auto w-16 h-16 rounded-lg bg-[var(--bg-secondary)] border-2 border-[var(--card-border)] flex items-center justify-center mb-4">
							<ImageIcon className="text-[var(--text-secondary)]" size={32} />
						</div>
						<div className="space-y-2">
							<p className="text-sm text-[var(--text-primary)]">
								Drag & drop a background image here, or click to select
							</p>
							<p className="text-xs text-[var(--text-secondary)]">
								PNG, JPG, GIF up to 5MB
							</p>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => fileInputRef.current?.click()}
								className="mt-2"
								disabled={isUploading}
							>
								{isUploading ? (
									<>
										<Loader2 size={16} className="mr-2 animate-spin" />
										Uploading...
									</>
								) : (
									<>
										<Upload size={16} className="mr-2" />
										Choose File
									</>
								)}
							</Button>
						</div>
					</div>
				)}

				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					onChange={handleFileInputChange}
					className="hidden"
				/>
			</div>
		</div>
	);
}



