"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
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
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-lg">Loading...</div>
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

	return (
		<div className="min-h-screen bg-gray-50">
			<nav className="bg-white shadow">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between h-16">
						<div className="flex items-center">
							<h1 className="text-xl font-semibold">Linktree Dashboard</h1>
						</div>
						<div className="flex items-center space-x-4">
							<span className="text-gray-700">{session.user?.email}</span>
							<button
								onClick={() => signOut()}
								className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
							>
								Sign out
							</button>
						</div>
					</div>
				</div>
			</nav>

			<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
				<div className="px-4 py-6 sm:px-0">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
						{/* Profile Card */}
						<div className="bg-white shadow rounded-lg p-6">
							<h2 className="text-xl font-bold mb-4">Profile</h2>
							{profile ? (
								<div className="space-y-2">
									<p className="text-gray-600">
										<strong>Username:</strong> {profile.username}
									</p>
									<p className="text-gray-600">
										<strong>Display Name:</strong> {profile.displayName}
									</p>
									{profile.bio && (
										<p className="text-gray-600">
											<strong>Bio:</strong> {profile.bio}
										</p>
									)}
									{publicUrl && (
										<div className="mt-4 p-3 bg-blue-50 rounded">
											<p className="text-sm text-gray-600 mb-1">Your public profile:</p>
											<a
												href={publicUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-600 hover:underline break-all"
											>
												{publicUrl}
											</a>
										</div>
									)}
									<Link
										href="/dashboard/profile"
										className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
									>
										Edit Profile
									</Link>
								</div>
							) : (
								<div>
									<p className="text-gray-600 mb-4">
										Create your profile to get started
									</p>
									<Link
										href="/dashboard/profile"
										className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
									>
										Create Profile
									</Link>
								</div>
							)}
						</div>

						{/* Links Card */}
						<div className="bg-white shadow rounded-lg p-6">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-xl font-bold">Links</h2>
								<Link
									href="/dashboard/links"
									className="text-blue-600 hover:text-blue-700 text-sm"
								>
									Manage →
								</Link>
							</div>
							{links.length > 0 ? (
								<div className="space-y-2">
									<p className="text-gray-600">
										<strong>{links.length}</strong> link{links.length !== 1 ? "s" : ""}
									</p>
									<ul className="list-disc list-inside text-sm text-gray-600">
										{links.slice(0, 3).map((link) => (
											<li key={link._id}>{link.title}</li>
										))}
										{links.length > 3 && (
											<li className="text-gray-400">+{links.length - 3} more</li>
										)}
									</ul>
									<Link
										href="/dashboard/links"
										className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
									>
										Manage Links
									</Link>
								</div>
							) : (
								<div>
									<p className="text-gray-600 mb-4">No links yet</p>
									<Link
										href="/dashboard/links"
										className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
									>
										Add Your First Link
									</Link>
								</div>
							)}
						</div>
					</div>

					{/* Quick Stats */}
					{profile && links.length > 0 && (
						<div className="bg-white shadow rounded-lg p-6">
							<h2 className="text-xl font-bold mb-4">Quick Stats</h2>
							<div className="grid grid-cols-3 gap-4">
								<div>
									<p className="text-2xl font-bold text-blue-600">{links.length}</p>
									<p className="text-sm text-gray-600">Total Links</p>
								</div>
								<div>
									<p className="text-2xl font-bold text-green-600">
										{links.reduce((sum, link) => sum + (link.clicks || 0), 0)}
									</p>
									<p className="text-sm text-gray-600">Total Clicks</p>
								</div>
								<div>
									<p className="text-2xl font-bold text-purple-600">
										{links.length > 0
											? Math.round(
													(links.reduce((sum, link) => sum + (link.clicks || 0), 0) /
														links.length) *
														10
												) / 10
											: 0}
									</p>
									<p className="text-sm text-gray-600">Avg Clicks/Link</p>
								</div>
							</div>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}

