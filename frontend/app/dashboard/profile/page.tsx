"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, X } from "lucide-react";
import { profileApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AvatarUpload } from "@/components/ui/avatar-upload";

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
	const [avatarPreview, setAvatarPreview] = useState<string>("");

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
		if (watchedUsername && watchedUsername.length >= 3) {
			checkUsername(watchedUsername);
		} else {
			setUsernameAvailable(null);
		}
	}, [watchedUsername]);

	const loadProfile = async () => {
		try {
			const response = await profileApi.get(session!.accessToken as string);
			if (response.success && response.data.profile) {
				setProfile(response.data.profile);
				setValue("username", response.data.profile.username);
				setValue("displayName", response.data.profile.displayName);
				setValue("bio", response.data.profile.bio || "");
				setValue("font", response.data.profile.font || "");
				setValue("avatar", response.data.profile.avatar || "");
				setAvatarPreview(response.data.profile.avatar || "");
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
			if (profile) {
				await profileApi.update(data, token);
			} else {
				await profileApi.create(data, token);
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
								{watchedUsername && watchedUsername.length >= 3 && usernameAvailable !== null && (
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
