"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Link2, Sparkles, ChartBar, Palette, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { profileApi } from "@/lib/api";

export default function Home() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [profile, setProfile] = useState<any>(null);
	const [isLoadingProfile, setIsLoadingProfile] = useState(true);

	useEffect(() => {
		if (status === "authenticated" && session?.accessToken) {
			loadProfile();
		} else {
			setIsLoadingProfile(false);
		}
	}, [status, session]);

	const loadProfile = async () => {
		try {
			const response = await profileApi.get(session!.accessToken as string);
			if (response.success && response.data.profile) {
				setProfile(response.data.profile);
			}
		} catch (err) {
			console.error("Failed to load profile:", err);
		} finally {
			setIsLoadingProfile(false);
		}
	};

	const handleLogout = async () => {
		const { signOut } = await import("next-auth/react");
		await signOut({ redirect: false });
		router.push("/");
		router.refresh();
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)] relative overflow-hidden">
			{/* Animated gradient orbs */}
			<div className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-[var(--accent-primary)]/20 rounded-full filter blur-3xl animate-pulse" />
			<div
				className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-green-900/20 rounded-full filter blur-3xl animate-pulse"
				style={{ animationDelay: "1s" }}
			/>

			<div className="relative z-10 container mx-auto px-4 py-16">
				{/* Header */}
				<motion.header
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex justify-between items-center mb-12 sm:mb-16 md:mb-20 px-4"
				>
					<Link href="/" className="flex items-center gap-2">
						<Link2 className="text-[var(--accent-primary)]" size={28} />
						<span className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
							DevTree
						</span>
					</Link>
					<div className="flex items-center gap-2 sm:gap-3">
						{status === "loading" || isLoadingProfile ? (
							<div className="w-20 h-9 bg-[var(--bg-secondary)] rounded-lg animate-pulse" />
						) : session && profile ? (
							<>
								<Link href={`/${profile.username}`} target="_blank">
									<Button variant="outline" className="flex items-center gap-2 text-sm sm:text-base">
										<User size={16} />
										<span className="hidden sm:inline">@{profile.username}</span>
										<span className="sm:hidden">{profile.displayName?.split(" ")[0] || profile.username}</span>
									</Button>
								</Link>
								<Link href="/dashboard">
									<Button className="text-sm sm:text-base">Dashboard</Button>
								</Link>
							</>
						) : session && !profile ? (
							<>
								<Link href="/dashboard/profile">
									<Button variant="outline" className="text-sm sm:text-base">Setup Profile</Button>
								</Link>
								<Link href="/dashboard">
									<Button className="text-sm sm:text-base">Dashboard</Button>
								</Link>
							</>
						) : (
							<Link href="/login">
								<Button variant="outline" className="text-sm sm:text-base">Sign In</Button>
							</Link>
						)}
					</div>
				</motion.header>

				{/* Hero Section */}
				<div className="max-w-4xl mx-auto text-center">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
					>
						<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-4 sm:mb-6 bg-gradient-to-r from-[var(--text-primary)] to-[var(--accent-primary)] bg-clip-text text-transparent font-bold px-4">
							Showcase Your Live Projects
						</h1>
						<p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
							Create a developer portfolio that showcases your deployed projects. Perfect for
							recruiters to quickly evaluate your real work.
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
						className="flex flex-col sm:flex-row gap-4 justify-center mb-6"
					>
						<Link href="/signup">
							<Button>Get Started Free</Button>
						</Link>
					<Link href="/example">
							<Button variant="outline">View Example</Button>
						</Link>
					</motion.div>

					{/* Disclaimer */}
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
						className="text-xs sm:text-sm text-[var(--text-muted)] mb-20 max-w-2xl mx-auto px-4"
					>
						<strong className="text-[var(--text-secondary)]">Note:</strong> As of now, the backend is deployed on Render. Please have patience as the backend may be waking up for DevTree.
					</motion.p>

					{/* Features Grid */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.6 }}
						className="grid md:grid-cols-3 gap-6 mt-20"
					>
						{[
							{
								icon: Sparkles,
								title: "Beautiful Design",
								description:
									"Stunning dark theme with customizable colors and smooth animations",
							},
							{
								icon: ChartBar,
								title: "Track Performance",
								description:
									"Monitor clicks and engagement with built-in analytics",
							},
							{
								icon: Palette,
								title: "Full Customization",
								description:
									"Personalize your page with custom fonts, colors, and layouts",
							},
						].map((feature, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.8 + index * 0.1 }}
								whileHover={{ y: -8, scale: 1.05 }}
								className="bg-[var(--card-bg)]/50 backdrop-blur-sm border border-[var(--card-border)] rounded-xl p-8"
							>
								<feature.icon
									className="text-[var(--accent-primary)] mx-auto mb-4"
									size={40}
								/>
								<h3 className="mb-2 text-[var(--text-primary)] font-semibold">
									{feature.title}
								</h3>
								<p className="text-[var(--text-secondary)]">
									{feature.description}
								</p>
							</motion.div>
						))}
					</motion.div>
				</div>
			</div>
		</div>
	);
}