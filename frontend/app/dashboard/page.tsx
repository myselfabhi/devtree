"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Link2, User, ExternalLink, ChartBar, Eye, MousePointer, LogOut } from "lucide-react";
import { profileApi, linkApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

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
		if (!isLoading && links.length > 0) {
			const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
			const totalViews = totalClicks; // Using clicks as views for now
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
	}, [isLoading, links]);

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
			{/* Navigation Bar */}
			<motion.nav
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-[var(--card-bg)]/80 backdrop-blur-xl border-b border-[var(--card-border)] sticky top-0 z-50"
			>
				<div className="container mx-auto px-4 py-4 flex justify-between items-center">
					<div className="flex items-center gap-2">
						<Link2 className="text-[var(--accent-purple)]" size={28} />
						<span className="text-xl font-semibold text-[var(--text-primary)]">
							Linktree
						</span>
					</div>
					<div className="flex items-center gap-4">
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

			<div className="container mx-auto px-4 py-8">
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
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
				<div className="grid lg:grid-cols-2 gap-6">
					{/* Profile Card */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.4 }}
					>
						<Card>
							<CardContent className="p-6">
								<div className="flex items-start justify-between mb-6">
								<div className="flex items-center gap-4">
									<div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-purple-700 flex items-center justify-center">
										<User size={32} className="text-white" />
									</div>
									<div>
										<h2 className="text-xl mb-1 text-[var(--text-primary)] font-semibold">
											Profile Info
										</h2>
										<p className="text-[var(--text-secondary)]">
											{profile ? `@${profile.username}` : "No profile yet"}
										</p>
									</div>
								</div>
							</div>

							{profile ? (
								<div className="space-y-4">
									<div>
										<label className="text-sm text-[var(--text-secondary)]">
											Display Name
										</label>
										<p className="text-[var(--text-primary)]">{profile.displayName}</p>
									</div>
									{profile.bio && (
										<div>
											<label className="text-sm text-[var(--text-secondary)]">Bio</label>
											<p className="text-[var(--text-secondary)]">{profile.bio}</p>
										</div>
									)}
									{publicUrl && (
										<div>
											<label className="text-sm text-[var(--text-secondary)]">
												Public URL
											</label>
											<div className="flex items-center gap-2 text-[var(--accent-purple)]">
												<a
													href={publicUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="hover:underline"
												>
													{publicUrl}
												</a>
												<ExternalLink size={16} />
											</div>
										</div>
									)}
								</div>
							) : (
								<p className="text-[var(--text-secondary)] mb-4">
									Create your profile to get started
								</p>
							)}

								<Link href="/dashboard/profile">
									<Button className="w-full" className="mt-6" variant="outline">
										{profile ? "Edit Profile" : "Create Profile"}
									</Button>
								</Link>
							</CardContent>
						</Card>
					</motion.div>

					{/* Links Card */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.5 }}
					>
						<Card>
							<CardContent className="p-6">
								<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl text-[var(--text-primary)] font-semibold">
									Your Links
								</h2>
								<span className="text-[var(--text-secondary)]">
									{links.length} active
								</span>
							</div>

							{links.length > 0 ? (
								<div className="space-y-3">
									<p className="text-sm text-[var(--text-secondary)] mb-4">
										Top performing links
									</p>
									{topLinks.map((link, index) => (
										<motion.div
											key={link._id}
											initial={{ opacity: 0, x: 20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: 0.6 + index * 0.1 }}
											className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--card-border)]"
										>
											<div className="flex-1 min-w-0">
												<p className="truncate text-[var(--text-primary)]">
													{link.title}
												</p>
												<p className="text-sm text-[var(--text-secondary)] truncate">
													{link.url}
												</p>
											</div>
											<div className="flex items-center gap-2 ml-4">
												<ChartBar
													size={16}
													className="text-[var(--accent-purple)]"
												/>
												<span className="text-sm text-[var(--text-secondary)]">
													{link.clicks || 0}
												</span>
											</div>
										</motion.div>
									))}
								</div>
							) : (
								<div>
									<p className="text-[var(--text-secondary)] mb-4">No links yet</p>
								</div>
							)}

								<Link href="/dashboard/links">
									<Button className="w-full" className="mt-6">
										Manage Links
									</Button>
								</Link>
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
						<Card>
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
								<div>
									<h2 className="text-xl mb-2 text-[var(--text-primary)] font-semibold">
										Performance Overview
									</h2>
									<p className="text-[var(--text-secondary)]">
										Your links are performing great! Keep it up 🚀
									</p>
								</div>
									<ChartBar size={48} className="text-[var(--accent-purple)]" />
								</div>
							</CardContent>
						</Card>
					</motion.div>
				)}
			</div>
		</div>
	);
}
