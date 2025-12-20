"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
	ChartBar,
	MousePointer,
	Eye,
	TrendingUp,
	ArrowLeft,
	ExternalLink,
	Calendar,
	BarChart3,
} from "lucide-react";
import { linkApi, profileApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import Link from "next/link";

interface Link {
	_id: string;
	title: string;
	url: string;
	icon?: string;
	description?: string;
	order: number;
	clicks: number;
}

export default function AnalyticsPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [links, setLinks] = useState<Link[]>([]);
	const [profile, setProfile] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
			return;
		}

		if (status === "authenticated" && session?.accessToken) {
			loadAnalytics();
		}
	}, [status, session, router]);

	const loadAnalytics = async () => {
		try {
			const [linksRes, profileRes] = await Promise.allSettled([
				linkApi.getAll(session!.accessToken as string),
				profileApi.get(session!.accessToken as string),
			]);

			if (linksRes.status === "fulfilled" && linksRes.value.success) {
				setLinks(linksRes.value.data.links || []);
			}

			if (profileRes.status === "fulfilled" && profileRes.value.success && profileRes.value.data.profile) {
				setProfile(profileRes.value.data.profile);
			}
		} catch (err) {
			console.error("Failed to load analytics:", err);
		} finally {
			setIsLoading(false);
		}
	};

	if (status === "loading" || isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
				<LoadingSpinner />
			</div>
		);
	}

	// Calculate statistics
	const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
	const totalLinks = links.length;
	const averageClicks = totalLinks > 0 ? Math.round(totalClicks / totalLinks) : 0;
	const profileViews = profile?.views || 0;
	const topLink = links.length > 0 
		? links.reduce((prev, current) => (current.clicks > prev.clicks ? current : prev))
		: null;

	// Sort links by clicks (descending)
	const sortedLinks = [...links].sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
	const maxClicks = sortedLinks.length > 0 ? Math.max(...sortedLinks.map(l => l.clicks || 0)) : 1;

	return (
		<div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
			{/* Header */}
			<div className="bg-[var(--card-bg)]/80 backdrop-blur-xl border-b border-[var(--card-border)] sticky top-0 z-50">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Link href="/dashboard">
								<Button variant="ghost" size="icon">
									<ArrowLeft size={20} />
								</Button>
							</Link>
							<div>
								<h1 className="text-2xl font-bold text-[var(--text-primary)]">
									Analytics Dashboard
								</h1>
								<p className="text-sm text-[var(--text-secondary)]">
									Track your link performance
								</p>
							</div>
						</div>
						{profile && (
							<Link href={`/${profile.username}`} target="_blank">
								<Button variant="outline" className="flex items-center gap-2">
									<Eye size={18} />
									<span className="hidden sm:inline">View Profile</span>
								</Button>
							</Link>
						)}
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-8">
				{/* Summary Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
					>
						<Card>
							<CardContent className="p-6">
								<div className="flex items-start justify-between">
									<div>
										<p className="text-sm text-[var(--text-secondary)] mb-1">
											Total Clicks
										</p>
										<p className="text-3xl font-bold text-[var(--text-primary)]">
											{totalClicks.toLocaleString()}
										</p>
									</div>
									<MousePointer className="text-blue-500" size={32} />
								</div>
							</CardContent>
						</Card>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
					>
						<Card>
							<CardContent className="p-6">
								<div className="flex items-start justify-between">
									<div>
										<p className="text-sm text-[var(--text-secondary)] mb-1">
											Active Links
										</p>
										<p className="text-3xl font-bold text-[var(--text-primary)]">
											{totalLinks}
										</p>
									</div>
									<BarChart3 className="text-purple-500" size={32} />
								</div>
							</CardContent>
						</Card>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						<Card>
							<CardContent className="p-6">
								<div className="flex items-start justify-between">
									<div>
										<p className="text-sm text-[var(--text-secondary)] mb-1">
											Avg Clicks/Link
										</p>
										<p className="text-3xl font-bold text-[var(--text-primary)]">
											{averageClicks.toLocaleString()}
										</p>
									</div>
									<TrendingUp className="text-green-500" size={32} />
								</div>
							</CardContent>
						</Card>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
					>
						<Card>
							<CardContent className="p-6">
								<div className="flex items-start justify-between">
									<div>
										<p className="text-sm text-[var(--text-secondary)] mb-1">
											Top Link Clicks
										</p>
										<p className="text-3xl font-bold text-[var(--text-primary)]">
											{topLink ? topLink.clicks.toLocaleString() : "0"}
										</p>
									</div>
									<ChartBar className="text-orange-500" size={32} />
								</div>
							</CardContent>
						</Card>
					</motion.div>
				</div>

				{/* Link Performance Chart */}
				{links.length > 0 ? (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5 }}
						className="mb-8"
					>
						<Card>
							<CardHeader>
								<CardTitle className="text-[var(--text-primary)]">
									Link Performance
								</CardTitle>
								<CardDescription>
									Click count for each link
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{sortedLinks.map((link, index) => {
										const percentage = maxClicks > 0 
											? ((link.clicks || 0) / maxClicks) * 100 
											: 0;
										
										return (
											<motion.div
												key={link._id}
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: 0.6 + index * 0.05 }}
												className="space-y-2"
											>
												<div className="flex items-center justify-between mb-1">
													<div className="flex items-center gap-3 flex-1 min-w-0">
														<span className="text-sm font-medium text-[var(--text-secondary)] min-w-[24px]">
															#{index + 1}
														</span>
														<div className="flex-1 min-w-0">
															<p className="text-[var(--text-primary)] font-medium truncate">
																{link.title}
															</p>
															<p className="text-xs text-[var(--text-secondary)] truncate">
																{link.url}
															</p>
														</div>
													</div>
													<div className="flex items-center gap-4 ml-4">
														<span className="text-lg font-bold text-[var(--text-primary)] min-w-[60px] text-right">
															{link.clicks || 0}
														</span>
														<span className="text-xs text-[var(--text-secondary)] min-w-[40px]">
															{percentage.toFixed(0)}%
														</span>
													</div>
												</div>
												<div className="h-3 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
													<motion.div
														initial={{ width: 0 }}
														animate={{ width: `${percentage}%` }}
														transition={{ 
															duration: 0.8, 
															delay: 0.7 + index * 0.05,
															ease: "easeOut"
														}}
														className="h-full bg-gradient-to-r from-[var(--accent-purple)] to-purple-600 rounded-full"
													/>
												</div>
											</motion.div>
										);
									})}
								</div>
							</CardContent>
						</Card>
					</motion.div>
				) : (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5 }}
					>
						<Card>
							<CardContent className="p-12 text-center">
								<ChartBar className="mx-auto mb-4 text-[var(--text-secondary)]" size={48} />
								<h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
									No Analytics Data Yet
								</h3>
								<p className="text-[var(--text-secondary)] mb-6">
									Start adding links and sharing your profile to see analytics here.
								</p>
								<div className="flex gap-4 justify-center">
									<Link href="/dashboard/links">
										<Button>
											Add Links
										</Button>
									</Link>
									{profile && (
										<Link href={`/${profile.username}`} target="_blank">
											<Button variant="outline">
												View Profile
											</Button>
										</Link>
									)}
								</div>
							</CardContent>
						</Card>
					</motion.div>
				)}

				{/* Top Performing Links */}
				{links.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.7 }}
					>
						<Card>
							<CardHeader>
								<CardTitle className="text-[var(--text-primary)]">
									Top 5 Performing Links
								</CardTitle>
								<CardDescription>
									Your most clicked links
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{sortedLinks.slice(0, 5).map((link, index) => (
										<motion.div
											key={link._id}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: 0.8 + index * 0.1 }}
											className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--card-border)] hover:border-[var(--accent-purple)] transition-colors"
										>
											<div className="flex items-center gap-4 flex-1 min-w-0">
												<div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-purple-700 flex items-center justify-center font-bold text-white">
													{index + 1}
												</div>
												<div className="flex-1 min-w-0">
													<p className="font-medium text-[var(--text-primary)] truncate">
														{link.title}
													</p>
													<p className="text-sm text-[var(--text-secondary)] truncate">
														{link.url}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-6 ml-4">
												<div className="text-right">
													<p className="text-2xl font-bold text-[var(--text-primary)]">
														{link.clicks || 0}
													</p>
													<p className="text-xs text-[var(--text-secondary)]">
														clicks
													</p>
												</div>
												<a
													href={link.url}
													target="_blank"
													rel="noopener noreferrer"
													className="text-[var(--accent-purple)] hover:text-purple-400"
												>
													<ExternalLink size={20} />
												</a>
											</div>
										</motion.div>
									))}
								</div>
							</CardContent>
						</Card>
					</motion.div>
				)}
			</div>
		</div>
	);
}

