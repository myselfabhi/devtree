"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Link2, User, ExternalLink, ChartBar, Eye, MousePointer, LogOut, Sparkles } from "lucide-react";
import { profileApi, linkApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalTitle,
	ModalDescription,
	ModalFooter,
} from "@/components/ui/modal";

export default function DashboardPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [profile, setProfile] = useState<any>(null);
	const [links, setLinks] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [animatedStats, setAnimatedStats] = useState({
		totalClicks: 0,
		totalViews: 0,
		linkCount: 0,
	});

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
			return;
		}

		if (status === "authenticated" && session?.accessToken) {
			loadData();
		}
	}, [status, session, router]);

	const loadData = async () => {
		try {
			const [profileRes, linksRes] = await Promise.allSettled([
				profileApi.get(session!.accessToken as string),
				linkApi.getAll(session!.accessToken as string),
			]);

			if (profileRes.status === "fulfilled" && profileRes.value.success) {
				setProfile(profileRes.value.data.profile);
			}

			if (linksRes.status === "fulfilled" && linksRes.value.success) {
				setLinks(linksRes.value.data.links);
			}
		} catch (err) {
			console.error("Failed to load data:", err);
		} finally {
			setIsLoading(false);
		}
	};

	// Animate numbers on mount
	useEffect(() => {
		if (!isLoading) {
			const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
			const totalViews = profile?.views || 0; // Use actual profile views
			const linkCount = links.length;

			const duration = 1000;
			const steps = 30;
			const interval = duration / steps;

			let currentStep = 0;
			const timer = setInterval(() => {
				currentStep++;
				const progress = currentStep / steps;

				setAnimatedStats({
					totalClicks: Math.floor(totalClicks * progress),
					totalViews: Math.floor(totalViews * progress),
					linkCount: Math.floor(linkCount * progress),
				});

				if (currentStep >= steps) {
					clearInterval(timer);
					setAnimatedStats({
						totalClicks,
						totalViews,
						linkCount,
					});
				}
			}, interval);

			return () => clearInterval(timer);
		}
	}, [isLoading, links, profile]);

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

	// Show onboarding modal if user has no profile
	const showOnboarding = !isLoading && !profile;

	const getPublicUrl = () => {
		if (typeof window !== "undefined" && profile) {
			return `${window.location.origin}/${profile.username}`;
		}
		return null;
	};

	const publicUrl = getPublicUrl();
	const topLinks = links
		.sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
		.slice(0, 3);

	return (
		<div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
			{/* Onboarding Modal - Non-dismissible */}
			<Modal open={showOnboarding} closable={false}>
				<ModalContent>
					<ModalHeader>
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-purple-700 flex items-center justify-center">
								<Sparkles className="text-white" size={24} />
							</div>
							<div>
								<ModalTitle>Welcome to Linktree!</ModalTitle>
								<ModalDescription>
									Let's get you started by creating your profile
								</ModalDescription>
							</div>
						</div>
					</ModalHeader>
					<div className="px-6 pb-6">
						<p className="text-[var(--text-secondary)] mb-4">
							To get started, you need to create your profile. This will allow you to:
						</p>
						<ul className="space-y-2 mb-6 text-[var(--text-secondary)]">
							<li className="flex items-center gap-2">
								<div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-purple)]" />
								Set up your unique username
							</li>
							<li className="flex items-center gap-2">
								<div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-purple)]" />
								Customize your display name and bio
							</li>
							<li className="flex items-center gap-2">
								<div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-purple)]" />
								Start sharing your links
							</li>
						</ul>
					</div>
					<ModalFooter>
						<Link href="/dashboard/profile" className="w-full sm:w-auto">
							<Button size="lg" className="w-full sm:w-auto">
								Create Profile
							</Button>
						</Link>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Blur/disable content behind modal */}
			<div className={showOnboarding ? "blur-sm pointer-events-none select-none" : ""}>

			{/* Navigation Bar */}
			<motion.nav
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-[var(--card-bg)]/80 backdrop-blur-xl border-b border-[var(--card-border)] sticky top-0 z-50"
			>
				<div className="container mx-auto px-4 py-3 sm:py-4 flex justify-between items-center">
					<div className="flex items-center gap-2">
						<Link2 className="text-[var(--accent-purple)]" size={24} />
						<span className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">
							Linktree
						</span>
					</div>
					<div className="flex items-center gap-2 sm:gap-4">
						{profile && (
							<Link href={`/${profile.username}`} target="_blank">
								<Button
									variant="outline"
									className="flex items-center gap-2"
								>
									<Eye size={18} />
									<span className="hidden sm:inline">View Profile</span>
								</Button>
							</Link>
						)}
						<Button
							variant="secondary"
							onClick={() => signOut()}
							className="flex items-center gap-2"
						>
							<LogOut size={18} />
							<span className="hidden sm:inline">Logout</span>
						</Button>
					</div>
				</div>
			</motion.nav>

			<div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
				{/* Welcome Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-8"
				>
					<h1 className="text-3xl md:text-4xl mb-2 text-[var(--text-primary)] font-bold">
						Welcome back{profile?.displayName ? `, ${profile.displayName.split(" ")[0]}` : ""}! 👋
					</h1>
					<p className="text-[var(--text-secondary)]">
						Here's what's happening with your links
					</p>
				</motion.div>

				{/* Quick Stats */}
				{links.length > 0 && (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
						{[
							{
								icon: MousePointer,
								label: "Total Clicks",
								value: animatedStats.totalClicks,
								color: "text-blue-500",
							},
							{
								icon: Eye,
								label: "Profile Views",
								value: animatedStats.totalViews,
								color: "text-green-500",
							},
							{
								icon: ChartBar,
								label: "Active Links",
								value: animatedStats.linkCount,
								color: "text-purple-500",
							},
						].map((stat, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.1 + index * 0.1 }}
							>
								<Card>
									<CardContent className="p-6">
										<div className="flex items-start justify-between">
											<div>
												<p className="text-[var(--text-secondary)] mb-1">
													{stat.label}
												</p>
												<p className="text-3xl font-bold text-[var(--text-primary)]">
													{stat.value.toLocaleString()}
												</p>
											</div>
											<stat.icon className={stat.color} size={32} />
										</div>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				)}

				{/* Main Grid */}
				<div className="grid lg:grid-cols-2 gap-4 sm:gap-6 min-h-0">
					{/* Profile Card */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.4 }}
						className="flex"
					>
						<Card className="flex flex-col w-full">
							<CardContent className="p-4 sm:p-6 flex flex-col flex-1">
								<div className="flex items-start justify-between mb-4 sm:mb-6">
								<div className="flex items-center gap-3 sm:gap-4">
									<div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-purple-700 flex items-center justify-center overflow-hidden flex-shrink-0">
										{profile?.avatar ? (
											<img
												src={profile.avatar}
												alt={profile.displayName}
												className="w-full h-full object-cover"
											/>
										) : (
											<User size={20} className="sm:hidden text-white" />
										)}
										{!profile?.avatar && (
											<User size={24} className="hidden sm:block md:hidden text-white" />
										)}
										{!profile?.avatar && (
											<User size={32} className="hidden md:block text-white" />
										)}
									</div>
									<div className="min-w-0 flex-1">
										<h2 className="text-lg sm:text-xl mb-1 text-[var(--text-primary)] font-semibold">
											Profile Info
										</h2>
										<p className="text-sm sm:text-base text-[var(--text-secondary)] truncate">
											{profile ? `@${profile.username}` : "No profile yet"}
										</p>
									</div>
								</div>
							</div>

							<div className="flex-1 flex flex-col">
								{profile ? (
									<div className="space-y-3 sm:space-y-4 flex-1">
										<div>
											<label className="text-xs sm:text-sm text-[var(--text-secondary)] block mb-1">
												Display Name
											</label>
											<p className="text-sm sm:text-base text-[var(--text-primary)] break-words">{profile.displayName}</p>
										</div>
										{profile.bio && (
											<div>
												<label className="text-xs sm:text-sm text-[var(--text-secondary)] block mb-1">Bio</label>
												<p className="text-sm sm:text-base text-[var(--text-secondary)] break-words">{profile.bio}</p>
											</div>
										)}
										{publicUrl && (
											<div>
												<label className="text-xs sm:text-sm text-[var(--text-secondary)] block mb-1">
													Public URL
												</label>
												<div className="flex items-start gap-2 text-[var(--accent-purple)]">
													<a
														href={publicUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="hover:underline text-xs sm:text-sm break-all flex-1 min-w-0"
													>
														{publicUrl}
													</a>
													<ExternalLink size={14} className="flex-shrink-0 mt-0.5" />
												</div>
											</div>
										)}
									</div>
								) : (
									<p className="text-[var(--text-secondary)] mb-4 flex-1">
										Create your profile to get started
									</p>
								)}

								<Link href="/dashboard/profile" className="mt-auto">
									<Button className="w-full mt-4 sm:mt-6 text-sm sm:text-base" variant="outline" size="sm">
										{profile ? "Edit Profile" : "Create Profile"}
									</Button>
								</Link>
							</div>
							</CardContent>
						</Card>
					</motion.div>

					{/* Links Card */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.5 }}
						className="flex"
					>
						<Card className="flex flex-col w-full">
							<CardContent className="p-4 sm:p-6 flex flex-col flex-1">
								<div className="flex items-center justify-between mb-4 sm:mb-6">
								<h2 className="text-lg sm:text-xl text-[var(--text-primary)] font-semibold">
									Your Links
								</h2>
								<span className="text-xs sm:text-sm text-[var(--text-secondary)]">
									{links.length} active
								</span>
							</div>

							<div className="flex-1 flex flex-col min-h-0">
								{links.length > 0 ? (
									<div className="flex-1 flex flex-col min-h-0">
										<p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-3 sm:mb-4">
											Top performing links
										</p>
										<div className="flex-1 overflow-y-auto max-h-[300px] sm:max-h-[400px] pr-1 sm:pr-2 space-y-2 sm:space-y-3 custom-scrollbar">
											{topLinks.map((link, index) => (
												<motion.div
													key={link._id}
													initial={{ opacity: 0, x: 20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: 0.6 + index * 0.1 }}
													className="flex items-center justify-between p-2.5 sm:p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--card-border)] flex-shrink-0"
												>
													<div className="flex-1 min-w-0 pr-2">
														<p className="text-sm sm:text-base truncate text-[var(--text-primary)] font-medium">
															{link.title}
														</p>
														<p className="text-xs text-[var(--text-secondary)] truncate mt-0.5 sm:mt-1">
															{link.url}
														</p>
													</div>
													<div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
														<ChartBar
															size={14}
															className="text-[var(--accent-purple)] sm:w-4 sm:h-4"
														/>
														<span className="text-xs sm:text-sm text-[var(--text-primary)] font-medium">
															{link.clicks || 0}
														</span>
													</div>
												</motion.div>
											))}
										</div>
									</div>
								) : (
									<div className="flex-1">
										<p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-4">No links yet</p>
									</div>
								)}

								<Link href="/dashboard/links" className="mt-auto">
									<Button className="w-full mt-4 sm:mt-6 text-sm sm:text-base" size="sm">
										Manage Links
									</Button>
								</Link>
							</div>
							</CardContent>
						</Card>
					</motion.div>
				</div>

				{/* Performance Overview */}
				{profile && links.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.8 }}
						className="mt-6"
					>
						<Link href="/dashboard/analytics">
							<Card className="cursor-pointer hover:border-[var(--accent-purple)] transition-colors">
								<CardContent className="p-6">
									<div className="flex items-center justify-between">
										<div>
											<h2 className="text-xl mb-2 text-[var(--text-primary)] font-semibold">
												Performance Overview
											</h2>
											<p className="text-[var(--text-secondary)]">
												View detailed analytics and insights →
											</p>
										</div>
										<ChartBar size={48} className="text-[var(--accent-purple)]" />
									</div>
								</CardContent>
							</Card>
						</Link>
					</motion.div>
				)}
			</div>
			</div>
		</div>
	);
}
