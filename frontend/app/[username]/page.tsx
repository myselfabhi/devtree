"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { profileApi, linkApi } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

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

				// Track profile view (fire and forget - don't wait for it)
				profileApi.trackView(username).catch(err => {
					console.error("Failed to track profile view:", err);
				});
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
			<div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
				<LoadingSpinner />
			</div>
		);
	}

	if (error || !profile) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
						Profile Not Found
					</h1>
					<p className="text-[var(--text-secondary)]">
						The profile you're looking for doesn't exist.
					</p>
				</div>
			</div>
		);
	}

	// Get colors from profile (with defaults - using dark theme)
	const bgColor = (profile.colors as any)?.background || "var(--bg-primary)";
	const textColor = (profile.colors as any)?.text || "var(--text-primary)";
	const buttonColor = (profile.colors as any)?.button || "var(--accent-purple)";
	const buttonHoverColor = (profile.colors as any)?.buttonHover || "var(--accent-purple-hover)";
	
	// Get font from profile (with default)
	const fontFamily = profile.font ? `"${profile.font}", sans-serif` : "inherit";

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.2,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				type: "spring",
				stiffness: 100,
				damping: 12,
			},
		},
	};

	const avatarVariants = {
		hidden: { scale: 0, opacity: 0 },
		visible: {
			scale: 1,
			opacity: 1,
			transition: {
				type: "spring",
				stiffness: 200,
				damping: 15,
			},
		},
	};

	return (
		<div
			className="min-h-screen relative overflow-hidden"
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
			{/* Animated background gradient */}
			{!profile.backgroundImage && (
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--accent-purple)]/20 rounded-full filter blur-3xl animate-pulse" />
			)}

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.3 }}
				className="relative z-10 container mx-auto px-4 py-12 max-w-2xl"
			>
				{/* Profile Header */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="text-center mb-12"
				>
					{/* Avatar */}
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
						className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-purple-700 flex items-center justify-center shadow-xl"
					>
						{profile.avatar ? (
							<Image
								src={profile.avatar}
								alt={profile.displayName}
								width={128}
								height={128}
								className="rounded-full"
							/>
						) : (
							<span className="text-4xl text-white">
								{profile.displayName.charAt(0).toUpperCase()}
							</span>
						)}
					</motion.div>

					{/* Name and Username */}
					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="text-4xl mb-2 font-bold"
						style={{ color: textColor }}
					>
						{profile.displayName}
					</motion.h1>

					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4 }}
						className="text-[var(--text-secondary)] mb-4"
					>
						@{profile.username}
					</motion.p>

					{/* Bio */}
					{profile.bio && (
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5 }}
							className="text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed"
						>
							{profile.bio}
						</motion.p>
					)}
				</motion.div>

				{/* Links */}
				<div className="space-y-4">
					{links.map((link, index) => (
						<motion.a
							key={link._id}
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.6 + index * 0.1 }}
							whileHover={{ scale: 1.05, y: -4 }}
							whileTap={{ scale: 0.98 }}
							onClick={() => handleLinkClick(link._id, link.url)}
							className="block w-full p-5 rounded-2xl border border-[var(--card-border)] transition-all group"
							style={{
								backgroundColor: buttonColor,
								boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = buttonHoverColor;
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = buttonColor;
							}}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4 flex-1 min-w-0">
									{link.icon ? (
										<img
											src={link.icon}
											alt=""
											className="flex-shrink-0 w-6 h-6"
										/>
									) : (
										<ExternalLink size={24} className="flex-shrink-0 text-white/70" />
									)}
									<div className="flex-1 min-w-0 text-left">
										<p className="font-medium mb-0.5 truncate text-white">
											{link.title}
										</p>
										{link.description && (
											<p className="text-sm text-white/70 truncate">
												{link.description}
											</p>
										)}
									</div>
								</div>
								<ExternalLink
									size={20}
									className="flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity text-white"
								/>
							</div>
						</motion.a>
					))}
				</div>

				{links.length === 0 && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.8 }}
						className="text-center mt-16"
					>
						<p className="text-[var(--text-secondary)]">No links available yet.</p>
					</motion.div>
				)}
			</motion.div>
		</div>
	);
}



