"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { profileApi } from "@/lib/api";

const profileSchema = z.object({
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(30, "Username must be at most 30 characters")
		.regex(/^[a-z0-9_-]+$/, "Username can only contain lowercase letters, numbers, hyphens, and underscores"),
	displayName: z.string().min(2, "Display name must be at least 2 characters"),
	bio: z.string().optional(),
	font: z.string().optional(),
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
			}
		} catch (err: any) {
			if (err.message.includes("not found")) {
				// Profile doesn't exist yet, that's okay
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
				// Update existing profile
				await profileApi.update(data, token);
			} else {
				// Create new profile
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
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-lg">Loading...</div>
			</div>
		);
	}

	if (!session) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<nav className="bg-white shadow">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between h-16">
						<div className="flex items-center space-x-4">
							<button
								onClick={() => router.push("/dashboard")}
								className="text-gray-600 hover:text-gray-900"
							>
								← Back to Dashboard
							</button>
						</div>
					</div>
				</div>
			</nav>

			<main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
				<div className="px-4 py-6 sm:px-0">
					<div className="bg-white shadow rounded-lg p-6">
						<h2 className="text-2xl font-bold mb-6">
							{profile ? "Edit Profile" : "Create Profile"}
						</h2>

						{error && (
							<div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
								{error}
							</div>
						)}

						<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
							<div>
								<label htmlFor="username" className="block text-sm font-medium text-gray-700">
									Username
								</label>
								<input
									{...register("username")}
									type="text"
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
									placeholder="johndoe"
								/>
								{errors.username && (
									<p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
								)}
								{watchedUsername && watchedUsername.length >= 3 && usernameAvailable !== null && (
									<p
										className={`mt-1 text-sm ${
											usernameAvailable ? "text-green-600" : "text-red-600"
										}`}
									>
										{usernameAvailable ? "✓ Username available" : "✗ Username taken"}
									</p>
								)}
								<p className="mt-1 text-xs text-gray-500">
									Your profile will be available at /{watchedUsername || "username"}
								</p>
							</div>

							<div>
								<label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
									Display Name
								</label>
								<input
									{...register("displayName")}
									type="text"
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
									placeholder="John Doe"
								/>
								{errors.displayName && (
									<p className="mt-1 text-sm text-red-600">{errors.displayName.message}</p>
								)}
							</div>

							<div>
								<label htmlFor="bio" className="block text-sm font-medium text-gray-700">
									Bio (Optional)
								</label>
								<textarea
									{...register("bio")}
									rows={4}
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
									placeholder="Tell us about yourself..."
								/>
							</div>

							<div>
								<label htmlFor="font" className="block text-sm font-medium text-gray-700">
									Font (Optional)
								</label>
								<select
									{...register("font")}
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								>
									{GOOGLE_FONTS.map((font) => (
										<option key={font.value} value={font.value}>
											{font.label}
										</option>
									))}
								</select>
								<p className="mt-1 text-xs text-gray-500">
									Choose a font for your public profile page
								</p>
							</div>

							<div className="flex justify-end space-x-3">
								<button
									type="button"
									onClick={() => router.push("/dashboard")}
									className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={isSaving || (usernameAvailable === false && !profile)}
									className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isSaving ? "Saving..." : profile ? "Update Profile" : "Create Profile"}
								</button>
							</div>
						</form>
					</div>
				</div>
			</main>
		</div>
	);
}



