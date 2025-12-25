"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { profileApi, linkApi } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ProjectCard } from "@/components/ui/project-card";

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
	url?: string;
	description?: string;
	techStack?: string[];
	role?: "Frontend" | "Backend" | "Full Stack";
	githubUrl?: string;
	status?: "live" | "down" | "slow" | "unknown";
	lastCheckedAt?: Date;
	screenshotUrl?: string;
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

	const handleLinkClick = async (linkId: string) => {
		try {
			await linkApi.track(linkId);
		} catch (err) {
			console.error("Failed to track click:", err);
		}
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
	const buttonColor = (profile.colors as any)?.button || "var(--accent-primary)";
	const buttonHoverColor = (profile.colors as any)?.buttonHover || "var(--accent-hover)";
	
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
			{/* Dark overlay for background images to ensure text readability */}
			{profile.backgroundImage && (
				<div 
					className="absolute inset-0 bg-black/60 z-0"
					style={{
						backgroundColor: profile.colors?.overlay 
							? `${profile.colors.overlay}80` 
							: "rgba(0, 0, 0, 0.6)"
					}}
				/>
			)}

			{/* Animated background gradient */}
			{!profile.backgroundImage && (
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-[var(--accent-primary)]/20 rounded-full filter blur-3xl animate-pulse" />
			)}

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.3 }}
				className="relative z-10 container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-12 max-w-2xl"
			>
				{/* Profile Header */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="text-center mb-8 sm:mb-12"
				>
					{/* Avatar */}
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
						className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-green-700 flex items-center justify-center shadow-xl overflow-hidden"
					>
						{profile.avatar ? (
							<img
								src={profile.avatar}
								alt={profile.displayName}
								className="w-full h-full object-cover"
							/>
						) : (
							<span className="text-xl sm:text-2xl md:text-4xl text-white font-semibold">
								{profile.displayName.charAt(0).toUpperCase()}
							</span>
						)}
					</motion.div>

					{/* Name and Username */}
					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="text-2xl sm:text-3xl md:text-4xl mb-2 font-bold px-2 break-words"
						style={{ color: textColor }}
					>
						{profile.displayName}
					</motion.h1>

					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4 }}
						className="text-sm sm:text-base text-[var(--text-secondary)] mb-4 px-2"
					>
						@{profile.username}
					</motion.p>

					{/* Bio */}
					{profile.bio && (
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5 }}
							className="text-sm sm:text-base text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed px-4"
						>
							{profile.bio}
						</motion.p>
					)}
				</motion.div>

				{/* Project Cards */}
				<div className="space-y-4">
					{links.map((link, index) => (
						<ProjectCard
							key={link._id}
							projectId={link._id}
							username={username}
							title={link.title}
							description={link.description}
							index={index}
						/>
					))}
				</div>

				{links.length === 0 && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.8 }}
						className="text-center mt-16"
					>
						<p className="text-[var(--text-secondary)]">No projects available yet.</p>
					</motion.div>
				)}
			</motion.div>
		</div>
	);
}



