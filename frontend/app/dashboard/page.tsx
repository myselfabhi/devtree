"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { profileApi, linkApi } from "@/lib/api";

export default function DashboardPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [profile, setProfile] = useState<any>(null);
	const [links, setLinks] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);

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

	if (status === "loading" || isLoading) {
		return (
			<div
				className="min-h-screen flex items-center justify-center"
				style={{ backgroundColor: "var(--bg-primary)" }}
			>
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

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const cardVariants = {
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

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="min-h-screen"
			style={{ backgroundColor: "var(--bg-primary)" }}
		>
			<nav
				className="shadow-lg"
				style={{
					backgroundColor: "var(--bg-card)",
					borderBottom: "1px solid var(--border-color)",
				}}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between h-16">
						<div className="flex items-center">
							<motion.h1
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.3 }}
								className="text-xl font-semibold"
								style={{ color: "var(--text-primary)" }}
							>
								Linktree Dashboard
							</motion.h1>
						</div>
						<div className="flex items-center space-x-4">
							<motion.span
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.2 }}
								style={{ color: "var(--text-secondary)" }}
							>
								{session.user?.email}
							</motion.span>
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => signOut()}
								className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
								style={{
									backgroundColor: "var(--error)",
									color: "var(--text-primary)",
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.opacity = "0.9";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.opacity = "1";
								}}
							>
								Sign out
							</motion.button>
						</div>
					</div>
				</div>
			</nav>

			<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
				<div className="px-4 py-6 sm:px-0">
					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
					>
						{/* Profile Card */}
						<motion.div
							variants={cardVariants}
							whileHover={{ scale: 1.02, y: -5 }}
							className="shadow-lg rounded-lg p-6 transition-all"
							style={{
								backgroundColor: "var(--bg-card)",
								border: "1px solid var(--border-color)",
							}}
						>
							<h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
								Profile
							</h2>
							{profile ? (
								<div className="space-y-2">
									<p style={{ color: "var(--text-secondary)" }}>
										<strong style={{ color: "var(--text-primary)" }}>Username:</strong> {profile.username}
									</p>
									<p style={{ color: "var(--text-secondary)" }}>
										<strong style={{ color: "var(--text-primary)" }}>Display Name:</strong> {profile.displayName}
									</p>
									{profile.bio && (
										<p style={{ color: "var(--text-secondary)" }}>
											<strong style={{ color: "var(--text-primary)" }}>Bio:</strong> {profile.bio}
										</p>
									)}
									{publicUrl && (
										<div
											className="mt-4 p-3 rounded"
											style={{
												backgroundColor: "var(--bg-secondary)",
												border: "1px solid var(--border-color)",
											}}
										>
											<p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
												Your public profile:
											</p>
											<a
												href={publicUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="hover:underline break-all transition-colors"
												style={{ color: "var(--accent-primary)" }}
												onMouseEnter={(e) => {
													e.currentTarget.style.color = "var(--accent-hover)";
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.color = "var(--accent-primary)";
												}}
											>
												{publicUrl}
											</a>
										</div>
									)}
									<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
										<Link
											href="/dashboard/profile"
											className="mt-4 inline-block px-4 py-2 rounded-md transition-all shadow-lg"
											style={{
												backgroundColor: "var(--accent-primary)",
												color: "var(--text-primary)",
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.backgroundColor = "var(--accent-hover)";
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.backgroundColor = "var(--accent-primary)";
											}}
										>
											Edit Profile
										</Link>
									</motion.div>
								</div>
							) : (
								<div>
									<p className="mb-4" style={{ color: "var(--text-secondary)" }}>
										Create your profile to get started
									</p>
									<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
										<Link
											href="/dashboard/profile"
											className="inline-block px-4 py-2 rounded-md transition-all shadow-lg"
											style={{
												backgroundColor: "var(--accent-primary)",
												color: "var(--text-primary)",
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.backgroundColor = "var(--accent-hover)";
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.backgroundColor = "var(--accent-primary)";
											}}
										>
											Create Profile
										</Link>
									</motion.div>
								</div>
							)}
						</motion.div>

						{/* Links Card */}
						<motion.div
							variants={cardVariants}
							whileHover={{ scale: 1.02, y: -5 }}
							className="shadow-lg rounded-lg p-6 transition-all"
							style={{
								backgroundColor: "var(--bg-card)",
								border: "1px solid var(--border-color)",
							}}
						>
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
									Links
								</h2>
								<Link
									href="/dashboard/links"
									className="text-sm transition-colors"
									style={{ color: "var(--accent-primary)" }}
									onMouseEnter={(e) => {
										e.currentTarget.style.color = "var(--accent-hover)";
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.color = "var(--accent-primary)";
									}}
								>
									Manage →
								</Link>
							</div>
							{links.length > 0 ? (
								<div className="space-y-2">
									<p style={{ color: "var(--text-secondary)" }}>
										<strong style={{ color: "var(--text-primary)" }}>{links.length}</strong> link{links.length !== 1 ? "s" : ""}
									</p>
									<ul className="list-disc list-inside text-sm" style={{ color: "var(--text-secondary)" }}>
										{links.slice(0, 3).map((link) => (
											<li key={link._id}>{link.title}</li>
										))}
										{links.length > 3 && (
											<li style={{ color: "var(--text-muted)" }}>+{links.length - 3} more</li>
										)}
									</ul>
									<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
										<Link
											href="/dashboard/links"
											className="mt-4 inline-block px-4 py-2 rounded-md transition-all shadow-lg"
											style={{
												backgroundColor: "var(--accent-primary)",
												color: "var(--text-primary)",
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.backgroundColor = "var(--accent-hover)";
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.backgroundColor = "var(--accent-primary)";
											}}
										>
											Manage Links
										</Link>
									</motion.div>
								</div>
							) : (
								<div>
									<p className="mb-4" style={{ color: "var(--text-secondary)" }}>No links yet</p>
									<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
										<Link
											href="/dashboard/links"
											className="inline-block px-4 py-2 rounded-md transition-all shadow-lg"
											style={{
												backgroundColor: "var(--accent-primary)",
												color: "var(--text-primary)",
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.backgroundColor = "var(--accent-hover)";
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.backgroundColor = "var(--accent-primary)";
											}}
										>
											Add Your First Link
										</Link>
									</motion.div>
								</div>
							)}
						</motion.div>
					</motion.div>

					{/* Quick Stats */}
					{profile && links.length > 0 && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
							whileHover={{ scale: 1.02, y: -5 }}
							className="shadow-lg rounded-lg p-6 transition-all"
							style={{
								backgroundColor: "var(--bg-card)",
								border: "1px solid var(--border-color)",
							}}
						>
							<h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
								Quick Stats
							</h2>
							<div className="grid grid-cols-3 gap-4">
								<motion.div
									whileHover={{ scale: 1.1 }}
									className="text-center"
								>
									<motion.p
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ type: "spring", delay: 0.4 }}
										className="text-2xl font-bold"
										style={{ color: "var(--accent-primary)" }}
									>
										{links.length}
									</motion.p>
									<p className="text-sm" style={{ color: "var(--text-secondary)" }}>Total Links</p>
								</motion.div>
								<motion.div
									whileHover={{ scale: 1.1 }}
									className="text-center"
								>
									<motion.p
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ type: "spring", delay: 0.5 }}
										className="text-2xl font-bold"
										style={{ color: "var(--success)" }}
									>
										{links.reduce((sum, link) => sum + (link.clicks || 0), 0)}
									</motion.p>
									<p className="text-sm" style={{ color: "var(--text-secondary)" }}>Total Clicks</p>
								</motion.div>
								<motion.div
									whileHover={{ scale: 1.1 }}
									className="text-center"
								>
									<motion.p
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ type: "spring", delay: 0.6 }}
										className="text-2xl font-bold"
										style={{ color: "var(--accent-light)" }}
									>
										{links.length > 0
											? Math.round(
													(links.reduce((sum, link) => sum + (link.clicks || 0), 0) /
														links.length) *
														10
												) / 10
											: 0}
									</motion.p>
									<p className="text-sm" style={{ color: "var(--text-secondary)" }}>Avg Clicks/Link</p>
								</motion.div>
							</div>
						</motion.div>
					)}
				</div>
			</main>
		</motion.div>
	);
}

