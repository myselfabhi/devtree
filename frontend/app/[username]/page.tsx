"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.3 }}
					className="text-lg"
				>
					<motion.div
						animate={{ rotate: 360 }}
						transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
						className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mr-3"
					/>
					Loading...
				</motion.div>
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
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
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
				<motion.div
					variants={itemVariants}
					initial="hidden"
					animate="visible"
					className="text-center mb-8"
				>
					{profile.avatar && (
						<motion.div
							variants={avatarVariants}
							initial="hidden"
							animate="visible"
							className="mb-4 flex justify-center"
						>
							<motion.div
								whileHover={{ scale: 1.1, rotate: 5 }}
								whileTap={{ scale: 0.95 }}
								transition={{ type: "spring", stiffness: 300 }}
							>
								<Image
									src={profile.avatar}
									alt={profile.displayName}
									width={120}
									height={120}
									className="rounded-full border-4 border-white shadow-lg"
								/>
							</motion.div>
						</motion.div>
					)}

					<motion.h1
						variants={itemVariants}
						initial="hidden"
						animate="visible"
						className="text-3xl font-bold mb-2"
						style={{ color: textColor }}
					>
						{profile.displayName}
					</motion.h1>

					{profile.bio && (
						<motion.p
							variants={itemVariants}
							initial="hidden"
							animate="visible"
							className="text-lg mb-4"
							style={{ color: textColor, opacity: 0.8 }}
						>
							{profile.bio}
						</motion.p>
					)}
				</motion.div>

				{/* Links */}
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="space-y-3"
				>
					<AnimatePresence>
						{links.map((link, index) => (
							<motion.button
								key={link._id}
								variants={itemVariants}
								initial="hidden"
								animate="visible"
								exit={{ opacity: 0, scale: 0.8 }}
								whileHover={{
									scale: 1.05,
									y: -5,
									transition: { type: "spring", stiffness: 400, damping: 17 },
								}}
								whileTap={{ scale: 0.95 }}
								onClick={() => handleLinkClick(link._id, link.url)}
								className="w-full p-4 rounded-lg text-center font-medium shadow-md relative overflow-hidden"
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
								<motion.div
									initial={{ x: -100, opacity: 0 }}
									animate={{ x: 0, opacity: 1 }}
									transition={{ delay: index * 0.1 + 0.3 }}
									className="flex items-center justify-center"
								>
									{link.icon && (
										<motion.img
											src={link.icon}
											alt=""
											className="inline-block w-5 h-5 mr-2 align-middle"
											whileHover={{ rotate: 360 }}
											transition={{ duration: 0.5 }}
										/>
									)}
									<span>{link.title}</span>
								</motion.div>
								{link.description && (
									<motion.p
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: index * 0.1 + 0.5 }}
										className="text-sm mt-1 opacity-90"
									>
										{link.description}
									</motion.p>
								)}
							</motion.button>
						))}
					</AnimatePresence>
				</motion.div>

				{links.length === 0 && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="text-center mt-8"
						style={{ color: textColor, opacity: 0.6 }}
					>
						<p>No links available yet.</p>
					</motion.div>
				)}
			</div>
		</motion.div>
	);
}



