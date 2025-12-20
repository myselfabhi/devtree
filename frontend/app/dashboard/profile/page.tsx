"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, X, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { profileApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { BackgroundUpload } from "@/components/ui/background-upload";
import { ColorPicker } from "@/components/ui/color-picker";

const profileSchema = z.object({
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(30, "Username must be at most 30 characters")
		.regex(
			/^[a-z0-9_-]+$/,
			"Username can only contain lowercase letters, numbers, hyphens, and underscores"
		),
	displayName: z.string().min(2, "Display name must be at least 2 characters"),
	bio: z.string().optional(),
	font: z.string().optional(),
	avatar: z.string().optional(),
	backgroundImage: z.string().optional(),
	colors: z.object({
		background: z.string().optional(),
		text: z.string().optional(),
		button: z.string().optional(),
		buttonHover: z.string().optional(),
	}).optional(),
});

// Popular Google Fonts for link pages
const GOOGLE_FONTS = [
	{ value: "", label: "Default (System)" },
	{ value: "Inter", label: "Inter" },
	{ value: "Roboto", label: "Roboto" },
	{ value: "Open Sans", label: "Open Sans" },
	{ value: "Lato", label: "Lato" },
	{ value: "Montserrat", label: "Montserrat" },
	{ value: "Poppins", label: "Poppins" },
	{ value: "Raleway", label: "Raleway" },
	{ value: "Playfair Display", label: "Playfair Display" },
	{ value: "Merriweather", label: "Merriweather" },
	{ value: "Source Sans Pro", label: "Source Sans Pro" },
	{ value: "Nunito", label: "Nunito" },
];

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string>("");
	const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
	const [profile, setProfile] = useState<any>(null);
	const [originalUsername, setOriginalUsername] = useState<string>("");
	const [avatarPreview, setAvatarPreview] = useState<string>("");
	const [backgroundPreview, setBackgroundPreview] = useState<string>("");
	const [colors, setColors] = useState({
		background: "#0a0a0f",
		text: "#f8f9fa",
		button: "#8b5cf6",
		buttonHover: "#7c3aed",
	});
	const [showColorCustomization, setShowColorCustomization] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
		setValue,
	} = useForm<ProfileFormData>({
		resolver: zodResolver(profileSchema),
	});

	const watchedUsername = watch("username");

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
			return;
		}

		if (status === "authenticated" && session?.accessToken) {
			loadProfile();
		}
	}, [status, session, router]);

	useEffect(() => {
		// Only check username availability if:
		// 1. Username is different from original (user is actually changing it)
		// 2. Username is at least 3 characters
		// 3. We have an original username (profile exists)
		if (
			watchedUsername && 
			watchedUsername.length >= 3 &&
			originalUsername &&
			watchedUsername !== originalUsername
		) {
			checkUsername(watchedUsername);
		} else if (watchedUsername === originalUsername) {
			// Username is back to original, clear the availability indicator
			setUsernameAvailable(null);
		} else if (!watchedUsername || watchedUsername.length < 3) {
			setUsernameAvailable(null);
		}
	}, [watchedUsername, originalUsername]);

	const loadProfile = async () => {
		try {
			const response = await profileApi.get(session!.accessToken as string);
			if (response.success && response.data.profile) {
				const profileData = response.data.profile;
				setProfile(profileData);
				setValue("username", profileData.username);
				setValue("displayName", profileData.displayName);
				setValue("bio", profileData.bio || "");
				setValue("font", profileData.font || "");
				setValue("avatar", profileData.avatar || "");
				setValue("backgroundImage", profileData.backgroundImage || "");
				setAvatarPreview(profileData.avatar || "");
				setBackgroundPreview(profileData.backgroundImage || "");
				
				// Store original username to detect changes
				setOriginalUsername(profileData.username);
				
				// Load colors if they exist
				if (profileData.colors) {
					const loadedColors = {
						background: profileData.colors.background || "#0a0a0f",
						text: profileData.colors.text || "#f8f9fa",
						button: profileData.colors.button || "#8b5cf6",
						buttonHover: profileData.colors.buttonHover || "#7c3aed",
					};
					setColors(loadedColors);
					setValue("colors", loadedColors);
				}
			} else {
				// New user - no original username
				setOriginalUsername("");
			}
		} catch (err: any) {
			if (err.message.includes("not found")) {
				setProfile(null);
			} else {
				setError(err.message || "Failed to load profile");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const checkUsername = async (username: string) => {
		try {
			const response = await profileApi.checkUsername(username);
			if (response.success) {
				setUsernameAvailable(response.data.available);
			}
		} catch (err) {
			setUsernameAvailable(false);
		}
	};

	const onSubmit = async (data: ProfileFormData) => {
		setIsSaving(true);
		setError("");

		try {
			const token = session!.accessToken as string;
			const submitData = {
				...data,
				backgroundImage: backgroundPreview,
				colors: colors,
			};
			if (profile) {
				await profileApi.update(submitData, token);
			} else {
				await profileApi.create(submitData, token);
			}
			router.push("/dashboard");
		} catch (err: any) {
			setError(err.message || "Failed to save profile");
		} finally {
			setIsSaving(false);
		}
	};

	if (status === "loading" || isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
				<LoadingSpinner />
			</div>
		);
	}

	if (!session) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
			{/* Navigation */}
			<nav className="bg-[var(--card-bg)]/80 backdrop-blur-xl border-b border-[var(--card-border)]">
				<div className="container mx-auto px-4 py-4">
					<Button
						variant="secondary"
						onClick={() => router.push("/dashboard")}
						className="flex items-center gap-2"
					>
						<ArrowLeft size={18} />
						Back to Dashboard
					</Button>
				</div>
			</nav>

			<main className="container mx-auto px-4 py-8 max-w-2xl">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<Card>
						<CardContent className="p-6">
							<h2 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">
								{profile ? "Edit Profile" : "Create Profile"}
							</h2>

						<AnimatePresence>
							{error && (
								<motion.div
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: 20 }}
									className="mb-4 px-4 py-3 rounded-lg border border-red-500/50 bg-red-500/10 text-red-500"
								>
									{error}
								</motion.div>
							)}
						</AnimatePresence>

						<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
							<div>
								<Input
									{...register("username")}
									type="text"
									label="Username"
									placeholder="johndoe"
									error={errors.username?.message}
								/>
								{watchedUsername && 
								 watchedUsername.length >= 3 && 
								 originalUsername &&
								 watchedUsername !== originalUsername &&
								 usernameAvailable !== null && (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className={`mt-2 flex items-center gap-2 text-sm ${
											usernameAvailable ? "text-green-500" : "text-red-500"
										}`}
									>
										{usernameAvailable ? (
											<>
												<Check size={16} />
												Username available
											</>
										) : (
											<>
												<X size={16} />
												Username taken
											</>
										)}
									</motion.div>
								)}
								<p className="mt-1 text-xs text-[var(--text-secondary)]">
									Your profile will be available at /{watchedUsername || "username"}
								</p>
							</div>

							<Input
								{...register("displayName")}
								type="text"
								label="Display Name"
								placeholder="John Doe"
								error={errors.displayName?.message}
							/>

							<AvatarUpload
								value={avatarPreview}
								onChange={(value) => {
									setAvatarPreview(value);
									setValue("avatar", value);
								}}
							/>

							<Textarea
								{...register("bio")}
								label="Bio (Optional)"
								placeholder="Tell us about yourself..."
								rows={4}
							/>

							<div>
								<label className="block mb-2 text-[var(--text-secondary)] font-medium">
									Font (Optional)
								</label>
								<select
									{...register("font")}
									className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)] focus:border-transparent transition-all"
								>
									{GOOGLE_FONTS.map((font) => (
										<option key={font.value} value={font.value}>
											{font.label}
										</option>
									))}
								</select>
								<p className="mt-1 text-xs text-[var(--text-secondary)]">
									Choose a font for your public profile page
								</p>
							</div>

							{/* Background Image */}
							<BackgroundUpload
								value={backgroundPreview}
								onChange={(value) => {
									setBackgroundPreview(value);
									setValue("backgroundImage", value);
									
									// Auto-adjust colors for readability when background image is uploaded/removed
									if (value) {
										// Background image uploaded - use white text for readability
										const smartColors = {
											background: colors.background, // Keep user's choice or default
											text: "#ffffff", // Always white text for readability
											button: "#8b5cf6", // Keep purple or user's choice
											buttonHover: "#7c3aed",
										};
										setColors(smartColors);
										setValue("colors", smartColors);
									} else {
										// Background image removed - reset to default colors
										const defaultColors = {
											background: "#0a0a0f",
											text: "#f8f9fa",
											button: "#8b5cf6",
											buttonHover: "#7c3aed",
										};
										setColors(defaultColors);
										setValue("colors", defaultColors);
									}
								}}
							/>

							{/* Color Customization - Collapsible */}
							<div className="space-y-4 p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--card-border)]">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Sparkles size={20} className="text-[var(--accent-purple)]" />
										<h3 className="text-lg font-semibold text-[var(--text-primary)]">
											Color Customization
										</h3>
									</div>
									<div className="flex items-center gap-2">
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => {
												// Smart Mode: Auto-adjust colors for best readability
												const smartColors = backgroundPreview
													? {
															background: "#0a0a0f",
															text: "#ffffff", // White text for background images
															button: "#8b5cf6",
															buttonHover: "#7c3aed",
													  }
													: {
															background: "#0a0a0f",
															text: "#f8f9fa",
															button: "#8b5cf6",
															buttonHover: "#7c3aed",
													  };
												setColors(smartColors);
												setValue("colors", smartColors);
											}}
											className="flex items-center gap-1"
										>
											<Sparkles size={14} />
											Smart Mode
										</Button>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => setShowColorCustomization(!showColorCustomization)}
											className="flex items-center gap-1"
										>
											{showColorCustomization ? (
												<>
													<ChevronUp size={16} />
													Hide
												</>
											) : (
												<>
													<ChevronDown size={16} />
													Advanced
												</>
											)}
										</Button>
									</div>
								</div>
								
								{backgroundPreview && (
									<div className="px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
										<p className="text-sm text-blue-400">
											💡 <strong>Tip:</strong> Text color is automatically set to white for better readability with background images. Use Smart Mode to optimize all colors.
										</p>
									</div>
								)}

								{showColorCustomization && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										exit={{ opacity: 0, height: 0 }}
										className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
									>
										<ColorPicker
											label="Background Color"
											value={colors.background}
											onChange={(value) => {
												const newColors = { ...colors, background: value };
												setColors(newColors);
												setValue("colors", newColors);
											}}
										/>
										<ColorPicker
											label="Text Color"
											value={colors.text}
											onChange={(value) => {
												const newColors = { ...colors, text: value };
												setColors(newColors);
												setValue("colors", newColors);
											}}
										/>
										<ColorPicker
											label="Button Color"
											value={colors.button}
											onChange={(value) => {
												const newColors = { ...colors, button: value };
												setColors(newColors);
												setValue("colors", newColors);
											}}
										/>
										<ColorPicker
											label="Button Hover Color"
											value={colors.buttonHover}
											onChange={(value) => {
												const newColors = { ...colors, buttonHover: value };
												setColors(newColors);
												setValue("colors", newColors);
											}}
										/>
									</motion.div>
								)}
							</div>

							{/* Live Preview */}
							<div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--card-border)]">
								<h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
									Live Preview
								</h3>
								<div
									className="relative rounded-lg overflow-hidden border-2 border-[var(--card-border)]"
									style={{
										backgroundColor: colors.background,
										backgroundImage: backgroundPreview ? `url(${backgroundPreview})` : undefined,
										backgroundSize: "cover",
										backgroundPosition: "center",
										minHeight: "300px",
									}}
								>
									{/* Dark overlay for background images in preview */}
									{backgroundPreview && (
										<div className="absolute inset-0 bg-black/60 z-0" />
									)}
									<div className="p-6 space-y-4 relative z-10">
										{/* Avatar Preview */}
										<div className="flex justify-center">
											{avatarPreview ? (
												<img
													src={avatarPreview}
													alt="Preview"
													className="w-20 h-20 rounded-full object-cover border-4"
													style={{ borderColor: colors.button }}
												/>
											) : (
												<div
													className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
													style={{
														backgroundColor: colors.button,
														color: colors.text,
													}}
												>
													{watch("displayName")?.charAt(0).toUpperCase() || "U"}
												</div>
											)}
										</div>
										
										{/* Display Name Preview */}
										<h2
											className="text-2xl font-bold text-center"
											style={{ color: colors.text }}
										>
											{watch("displayName") || "Display Name"}
										</h2>
										
										{/* Bio Preview */}
										{watch("bio") && (
											<p
												className="text-sm text-center"
												style={{ color: colors.text, opacity: 0.8 }}
											>
												{watch("bio")}
											</p>
										)}
										
										{/* Button Preview */}
										<div className="flex justify-center pt-4">
											<button
												type="button"
												className="px-6 py-3 rounded-lg font-medium transition-colors"
												style={{
													backgroundColor: colors.button,
													color: "#ffffff",
												}}
												onMouseEnter={(e) => {
													e.currentTarget.style.backgroundColor = colors.buttonHover;
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.backgroundColor = colors.button;
												}}
											>
												Sample Link
											</button>
										</div>
									</div>
								</div>
							</div>

							<div className="flex justify-end gap-3 pt-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => router.push("/dashboard")}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={isSaving || (usernameAvailable === false && !profile)}
								>
									{isSaving ? <LoadingSpinner /> : profile ? "Update Profile" : "Create Profile"}
								</Button>
							</div>
						</form>
						</CardContent>
					</Card>
				</motion.div>
			</main>
		</div>
	);
}
