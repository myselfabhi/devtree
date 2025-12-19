"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { profileApi, linkApi } from "@/lib/api";

// Helper function to load Google Font
function loadGoogleFont(fontName: string) {
	if (!fontName) return;
	
	const fontFamily = fontName.replace(/\s+/g, "+");
	const linkId = `google-font-${fontFamily}`;
	
	// Check if font is already loaded
	if (document.getElementById(linkId)) return;
	
	const link = document.createElement("link");
	link.id = linkId;
	link.rel = "stylesheet";
	link.href = `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@400;500;600;700&display=swap`;
	document.head.appendChild(link);
}

interface Profile {
	id: string;
	username: string;
	displayName: string;
	bio?: string;
	avatar?: string;
	theme?: Record<string, unknown>;
	colors?: Record<string, unknown>;
	font?: string;
	backgroundImage?: string;
}

interface Link {
	_id: string;
	title: string;
	url: string;
	icon?: string;
	description?: string;
	order: number;
}

export default function PublicProfilePage() {
	const params = useParams();
	const username = params.username as string;
	const [profile, setProfile] = useState<Profile | null>(null);
	const [links, setLinks] = useState<Link[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string>("");

	useEffect(() => {
		if (username) {
			loadProfile();
		}
	}, [username]);

	const loadProfile = async () => {
		try {
			const [profileRes, linksRes] = await Promise.all([
				profileApi.getPublic(username),
				linkApi.getPublic(username),
			]);

			if (profileRes.success) {
				const profileData = profileRes.data.profile;
				setProfile(profileData);
				
				// Load Google Font if specified
				if (profileData.font) {
					loadGoogleFont(profileData.font);
				}
			}

			if (linksRes.success) {
				setLinks(linksRes.data.links);
			}
		} catch (err: any) {
			setError(err.message || "Profile not found");
		} finally {
			setIsLoading(false);
		}
	};

	const handleLinkClick = async (linkId: string, url: string) => {
		try {
			// Track click
			await linkApi.track(linkId);
		} catch (err) {
			console.error("Failed to track click:", err);
		}

		// Open link in new tab
		window.open(url, "_blank", "noopener,noreferrer");
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-lg">Loading...</div>
			</div>
		);
	}

	if (error || !profile) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
					<p className="text-gray-600">The profile you're looking for doesn't exist.</p>
				</div>
			</div>
		);
	}

	// Get colors from profile (with defaults)
	const bgColor = (profile.colors as any)?.background || "#ffffff";
	const textColor = (profile.colors as any)?.text || "#000000";
	const buttonColor = (profile.colors as any)?.button || "#3b82f6";
	const buttonHoverColor = (profile.colors as any)?.buttonHover || "#2563eb";
	
	// Get font from profile (with default)
	const fontFamily = profile.font ? `"${profile.font}", sans-serif` : "inherit";

	return (
		<div
			className="min-h-screen flex items-center justify-center px-4 py-8"
			style={{
				backgroundColor: bgColor,
				backgroundImage: profile.backgroundImage
					? `url(${profile.backgroundImage})`
					: undefined,
				backgroundSize: "cover",
				backgroundPosition: "center",
				fontFamily: fontFamily,
			}}
		>
			<div className="w-full max-w-md">
				{/* Profile Header */}
				<div className="text-center mb-8">
					{profile.avatar && (
						<div className="mb-4 flex justify-center">
							<Image
								src={profile.avatar}
								alt={profile.displayName}
								width={120}
								height={120}
								className="rounded-full border-4 border-white shadow-lg"
							/>
						</div>
					)}

					<h1
						className="text-3xl font-bold mb-2"
						style={{ color: textColor }}
					>
						{profile.displayName}
					</h1>

					{profile.bio && (
						<p className="text-lg mb-4" style={{ color: textColor, opacity: 0.8 }}>
							{profile.bio}
						</p>
					)}
				</div>

				{/* Links */}
				<div className="space-y-3">
					{links.map((link) => (
						<button
							key={link._id}
							onClick={() => handleLinkClick(link._id, link.url)}
							className="w-full p-4 rounded-lg text-center font-medium transition-all hover:scale-105 shadow-md"
							style={{
								backgroundColor: buttonColor,
								color: "#ffffff",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = buttonHoverColor;
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = buttonColor;
							}}
						>
							{link.icon && (
								<img
									src={link.icon}
									alt=""
									className="inline-block w-5 h-5 mr-2 align-middle"
								/>
							)}
							<span>{link.title}</span>
							{link.description && (
								<p className="text-sm mt-1 opacity-90">{link.description}</p>
							)}
						</button>
					))}
				</div>

				{links.length === 0 && (
					<div className="text-center mt-8" style={{ color: textColor, opacity: 0.6 }}>
						<p>No links available yet.</p>
					</div>
				)}
			</div>
		</div>
	);
}



